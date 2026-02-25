import Map "mo:core/Map";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

// Apply data migration logic on reload
(with migration = Migration.run)
actor {
  public type UserProfile = {
    name : Text;
  };

  // Updated line item type with unitary system
  public type LineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    quantity : Float;
    unit : Text;
    rate : Float;
    totalAmount : Float;
  };

  // Bill type
  public type Bill = {
    partyName : Text;
    invoiceNumber : Text;
    baseAmount : Float;
    cgst : Float;
    sgst : Float;
    totalGst : Float;
    roundOff : Float;
    finalAmount : Float;
    amountPaid : Float;
    pendingAmount : Float;
    billDate : Int;
    lineItems : [LineItem];
  };

  // Bill operation type
  public type BillOperation = {
    partyName : Text;
    invoiceNumber : Text;
    billDate : Int;
    lineItems : [LineItem];
    amountPaid : Float;
  };

  // Party profile type
  public type PartyProfile = {
    gstNumber : Text;
  };

  // Party summary type
  public type PartySummary = {
    partyName : Text;
    gstNumber : Text;
    totalBilled : Float;
    totalPaid : Float;
    totalPending : Float;
    billCount : Nat;
  };

  // Company report type
  public type CompanyReport = {
    totalServiceAmount : Float;
    totalReceived : Float;
    totalPending : Float;
    bills : [Bill];
  };

  // Profit and loss summary type
  public type ProfitLossSummary = {
    totalBilled : Float;
    totalReceived : Float;
    totalOutstanding : Float;
    profitLossIndicator : Bool;
  };

  // Maximum line items per bill
  let MAX_LINE_ITEMS : Nat = 15;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Stable persistent store for all authenticated persistent bills
  let userProfiles = Map.empty<Principal, UserProfile>();
  let partyGstNumbers = Map.empty<Text, PartyProfile>();
  let bills = Map.empty<Text, Bill>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func savePartyGstNumber(partyName : Text, gstNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save GST numbers");
    };
    partyGstNumbers.add(partyName, { gstNumber });
  };

  public query ({ caller }) func getPartyGstNumber(partyName : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view GST numbers");
    };
    switch (partyGstNumbers.get(partyName)) {
      case (?profile) { profile.gstNumber };
      case (null) { "" };
    };
  };

  public query ({ caller }) func billExists(invoiceNumber : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check bills");
    };
    bills.containsKey(invoiceNumber);
  };

  public shared ({ caller }) func addBill(billOp : BillOperation) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bills");
    };

    if (billOp.lineItems.size() > MAX_LINE_ITEMS) {
      Runtime.trap("Too many line items: maximum allowed is 15");
    };

    switch (bills.get(billOp.invoiceNumber)) {
      case (?_) {
        Runtime.trap("Invoice number '" # billOp.invoiceNumber # "' already exists. Please enter a unique invoice number.");
      };
      case (null) {};
    };

    // Calculate base amount from line items
    var baseAmount : Float = 0.0;
    for (item in billOp.lineItems.values()) {
      baseAmount += item.totalAmount;
    };

    let totalGst = baseAmount * 0.18;
    let cgst = totalGst / 2.0;
    let sgst = totalGst / 2.0;
    let finalAmountRaw = baseAmount + totalGst;
    let finalAmountRounded = (finalAmountRaw + 0.5).toInt().toFloat();
    let roundOff = finalAmountRounded - finalAmountRaw;
    let amountPaid = billOp.amountPaid;

    let bill : Bill = {
      partyName = billOp.partyName;
      invoiceNumber = billOp.invoiceNumber;
      baseAmount;
      cgst;
      sgst;
      totalGst;
      roundOff;
      finalAmount = finalAmountRounded;
      amountPaid;
      pendingAmount = finalAmountRounded - amountPaid;
      billDate = billOp.billDate;
      lineItems = billOp.lineItems;
    };

    bills.add(billOp.invoiceNumber, bill);
    bill;
  };

  public shared ({ caller }) func editBill(invoiceNumber : Text, updatedBillOp : BillOperation) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit bills");
    };

    if (updatedBillOp.lineItems.size() > MAX_LINE_ITEMS) {
      Runtime.trap("Too many line items: maximum allowed is 15");
    };

    switch (bills.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?existingBill) {
        // If invoice number is being changed, check for duplicate
        if (updatedBillOp.invoiceNumber != invoiceNumber) {
          switch (bills.get(updatedBillOp.invoiceNumber)) {
            case (?_) {
              Runtime.trap("Invoice number '" # updatedBillOp.invoiceNumber # "' already exists. Please enter a unique invoice number.");
            };
            case (null) {};
          };
        };

        // Calculate base amount from line items
        var baseAmount : Float = 0.0;
        for (item in updatedBillOp.lineItems.values()) {
          baseAmount += item.totalAmount;
        };

        let totalGst = baseAmount * 0.18;
        let cgst = totalGst / 2.0;
        let sgst = totalGst / 2.0;
        let finalAmountRaw = baseAmount + totalGst;
        let finalAmountRounded = (finalAmountRaw + 0.5).toInt().toFloat();
        let roundOff = finalAmountRounded - finalAmountRaw;
        let amountPaid = updatedBillOp.amountPaid;

        let updatedBill : Bill = {
          partyName = updatedBillOp.partyName;
          invoiceNumber = updatedBillOp.invoiceNumber;
          baseAmount;
          cgst;
          sgst;
          totalGst;
          roundOff;
          finalAmount = finalAmountRounded;
          amountPaid;
          pendingAmount = finalAmountRounded - amountPaid;
          billDate = updatedBillOp.billDate;
          lineItems = updatedBillOp.lineItems;
        };

        // Remove old entry if invoice number changed
        if (updatedBillOp.invoiceNumber != invoiceNumber) {
          bills.remove(invoiceNumber);
        };

        bills.add(updatedBillOp.invoiceNumber, updatedBill);
        updatedBill;
      };
    };
  };

  public shared ({ caller }) func deleteBill(invoiceNumber : Text) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete bills");
    };

    switch (bills.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) {
        bills.remove(invoiceNumber);
        bill;
      };
    };
  };

  public query ({ caller }) func getBill(invoiceNumber : Text) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bills");
    };

    switch (bills.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) { bill };
    };
  };

  public query ({ caller }) func getBillsByParty(partyName : Text) : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search bills");
    };

    let allBills = bills.values().toArray();
    allBills.filter(
      func(bill : Bill) : Bool {
        bill.partyName.startsWith(#text partyName);
      }
    );
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bills");
    };

    let allBills = bills.values().toArray();
    allBills.sort(
      func(a, b) {
        Text.compare(a.invoiceNumber, b.invoiceNumber);
      }
    );
  };

  public query ({ caller }) func getAggregate() : async {
    totalAmount : Float;
    totalGst : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view aggregates");
    };

    let allBills = bills.values().toArray();
    var totalAmount = 0.0;
    var totalGst = 0.0;

    for (bill in allBills.vals()) {
      totalAmount += bill.finalAmount;
      totalGst += bill.totalGst;
    };

    {
      totalAmount;
      totalGst;
    };
  };

  public query ({ caller }) func getPartySummary() : async [PartySummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view party summaries");
    };

    let billsArray = bills.values().toArray();

    // Group bills by party name
    let grouped = billsArray.foldLeft(
      Map.empty<Text, PartySummary>(),
      func(acc, bill) {
        let current = switch (acc.get(bill.partyName)) {
          case (null) {
            {
              partyName = bill.partyName;
              gstNumber = switch (partyGstNumbers.get(bill.partyName)) {
                case (?profile) { profile.gstNumber };
                case (null) { "" };
              };
              totalBilled = bill.finalAmount;
              totalPaid = bill.amountPaid;
              totalPending = bill.pendingAmount;
              billCount = 1;
            };
          };
          case (?existing) {
            {
              existing with
              totalBilled = existing.totalBilled + bill.finalAmount;
              totalPaid = existing.totalPaid + bill.amountPaid;
              totalPending = existing.totalPending + bill.pendingAmount;
              billCount = existing.billCount + 1;
            };
          };
        };
        acc.add(bill.partyName, current);
        acc;
      },
    );

    grouped.values().toArray();
  };

  public query ({ caller }) func getPartySummaryByDateRange(from : Int, to : Int) : async [PartySummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view party summaries");
    };

    let billsArray = bills.values().toArray();
    let filteredBills = billsArray.filter(
      func(bill) {
        bill.billDate >= from and bill.billDate <= to
      }
    );

    // Group filtered bills by party name
    let grouped = filteredBills.foldLeft(
      Map.empty<Text, PartySummary>(),
      func(acc, bill) {
        let current = switch (acc.get(bill.partyName)) {
          case (null) {
            {
              partyName = bill.partyName;
              gstNumber = switch (partyGstNumbers.get(bill.partyName)) {
                case (?profile) { profile.gstNumber };
                case (null) { "" };
              };
              totalBilled = bill.finalAmount;
              totalPaid = bill.amountPaid;
              totalPending = bill.pendingAmount;
              billCount = 1;
            };
          };
          case (?existing) {
            {
              existing with
              totalBilled = existing.totalBilled + bill.finalAmount;
              totalPaid = existing.totalPaid + bill.amountPaid;
              totalPending = existing.totalPending + bill.pendingAmount;
              billCount = existing.billCount + 1;
            };
          };
        };
        acc.add(bill.partyName, current);
        acc;
      },
    );

    grouped.values().toArray();
  };

  public query ({ caller }) func getCompanyReport(partyName : Text, from : Int, to : Int) : async CompanyReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view company reports");
    };

    let billsArray = bills.values().toArray();

    let filteredBills = billsArray.filter(
      func(bill) {
        bill.partyName == partyName and (bill.billDate >= from and bill.billDate <= to)
      }
    );

    var totalServiceAmount : Float = 0.0;
    var totalReceived : Float = 0.0;

    for (bill in filteredBills.vals()) {
      totalServiceAmount += bill.finalAmount;
      totalReceived += bill.amountPaid;
    };

    let sortedBills = filteredBills.sort(
      func(a, b) {
        Int.compare(b.billDate, a.billDate);
      }
    );

    {
      totalServiceAmount;
      totalReceived;
      totalPending = totalServiceAmount - totalReceived;
      bills = sortedBills;
    };
  };

  public query ({ caller }) func getProfitLossSummary(from : Int, to : Int) : async ProfitLossSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profit/loss summary");
    };

    let billsArray = bills.values().toArray();
    let filteredBills = billsArray.filter(
      func(bill) {
        bill.billDate >= from and bill.billDate <= to
      }
    );

    var totalBilled : Float = 0.0;
    var totalReceived : Float = 0.0;

    for (bill in filteredBills.vals()) {
      totalBilled += bill.finalAmount;
      totalReceived += bill.amountPaid;
    };

    {
      totalBilled;
      totalReceived;
      totalOutstanding = totalBilled - totalReceived;
      profitLossIndicator = totalReceived > 0.0;
    };
  };

  // Returns all unique party names from the bills for autocomplete suggestions
  public query ({ caller }) func getUniquePartyNames() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view party names");
    };

    let billsArray = bills.values().toArray();
    let seen = Map.empty<Text, Bool>();
    for (bill in billsArray.vals()) {
      seen.add(bill.partyName, true);
    };
    seen.keys().toArray();
  };

  // Returns all unique product names from the bills for autocomplete suggestions
  public query ({ caller }) func getUniqueProductNames() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view product names");
    };

    let billsArray = bills.values().toArray();
    let seen = Map.empty<Text, Bool>();
    for (bill in billsArray.vals()) {
      for (item in bill.lineItems.vals()) {
        if (item.productName != "") {
          seen.add(item.productName, true);
        };
      };
    };
    seen.keys().toArray();
  };
};
