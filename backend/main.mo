import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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
  let MAX_LINE_ITEMS : Nat = 15; // Reduced from 30 to 15

  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  let userBills = Map.empty<Principal, Map.Map<Text, Bill>>();
  let partyGstNumbers = Map.empty<Text, PartyProfile>();

  // Get or create user bill store
  func getOrCreateUserBillStore(user : Principal, isAuthorized : Bool) : Map.Map<Text, Bill> {
    if (not isAuthorized) {
      Runtime.trap("Unauthorized: Only the owner can access bills");
    };
    switch (userBills.get(user)) {
      case (null) {
        let newStore = Map.empty<Text, Bill>();
        userBills.add(user, newStore);
        newStore;
      };
      case (?store) { store };
    };
  };

  public shared ({ caller }) func savePartyGstNumber(partyName : Text, gstNumber : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can save GST numbers");
    };
    let profile = { gstNumber };
    partyGstNumbers.add(partyName, profile);
  };

  public query func getPartyGstNumber(partyName : Text) : async Text {
    switch (partyGstNumbers.get(partyName)) {
      case (?profile) { profile.gstNumber };
      case (null) { "" };
    };
  };

  public query ({ caller }) func billExists(invoiceNumber : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can check bills");
    };
    switch (userBills.get(caller)) {
      case (?store) { store.containsKey(invoiceNumber) };
      case (null) { false };
    };
  };

  public shared ({ caller }) func addBill(billOp : BillOperation) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can add bills");
    };

    if (billOp.lineItems.size() > MAX_LINE_ITEMS) {
      Runtime.trap("Too many line items: maximum allowed is 15");
    };

    let userStore = getOrCreateUserBillStore(caller, true);

    switch (userStore.get(billOp.invoiceNumber)) {
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

    let bill : Bill = {
      partyName = billOp.partyName;
      invoiceNumber = billOp.invoiceNumber;
      baseAmount;
      cgst;
      sgst;
      totalGst;
      roundOff;
      finalAmount = finalAmountRounded;
      amountPaid = 0.0;
      pendingAmount = finalAmountRounded;
      billDate = billOp.billDate;
      lineItems = billOp.lineItems;
    };

    userStore.add(billOp.invoiceNumber, bill);
    bill;
  };

  public shared ({ caller }) func editBill(invoiceNumber : Text, updatedBillOp : BillOperation) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can edit bills");
    };

    if (updatedBillOp.lineItems.size() > MAX_LINE_ITEMS) {
      Runtime.trap("Too many line items: maximum allowed is 15");
    };

    let userStore = getOrCreateUserBillStore(caller, true);

    switch (userStore.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?existingBill) {
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

        let updatedBill : Bill = {
          partyName = updatedBillOp.partyName;
          invoiceNumber = invoiceNumber;
          baseAmount;
          cgst;
          sgst;
          totalGst;
          roundOff;
          finalAmount = finalAmountRounded;
          amountPaid = existingBill.amountPaid;
          pendingAmount = finalAmountRounded - existingBill.amountPaid;
          billDate = updatedBillOp.billDate;
          lineItems = updatedBillOp.lineItems;
        };

        userStore.add(invoiceNumber, updatedBill);
        updatedBill;
      };
    };
  };

  public shared ({ caller }) func deleteBill(invoiceNumber : Text) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can delete bills");
    };

    let userStore = getOrCreateUserBillStore(caller, true);

    switch (userStore.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) {
        userStore.remove(invoiceNumber);
        bill;
      };
    };
  };

  public query ({ caller }) func getBill(invoiceNumber : Text) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view bills");
    };

    switch (userBills.get(caller)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?store) {
        switch (store.get(invoiceNumber)) {
          case (null) { Runtime.trap("Bill not found") };
          case (?bill) { bill };
        };
      };
    };
  };

  public query ({ caller }) func getBillsByParty(partyName : Text) : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can search bills");
    };

    switch (userBills.get(caller)) {
      case (null) { return [] };
      case (?store) {
        let allBills = store.values().toArray();
        allBills.filter(
          func(bill : Bill) : Bool {
            bill.partyName.startsWith(#text partyName);
          }
        );
      };
    };
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view bills");
    };

    switch (userBills.get(caller)) {
      case (null) { return [] };
      case (?store) {
        let allBills = store.values().toArray();
        allBills.sort(
          func(a, b) {
            Text.compare(a.invoiceNumber, b.invoiceNumber);
          }
        );
      };
    };
  };

  public query ({ caller }) func getAggregate() : async {
    totalAmount : Float;
    totalGst : Float;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view aggregates");
    };

    switch (userBills.get(caller)) {
      case (null) {
        return {
          totalAmount = 0.0;
          totalGst = 0.0;
        };
      };
      case (?store) {
        let allBills = store.values().toArray();
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
    };
  };

  public query ({ caller }) func getPartySummary() : async [PartySummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view party summaries");
    };

    switch (userBills.get(caller)) {
      case (null) { return [] };
      case (?store) {
        let billsArray = store.values().toArray();

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
    };
  };

  public query ({ caller }) func getPartySummaryByDateRange(from : Int, to : Int) : async [PartySummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view party summaries");
    };

    switch (userBills.get(caller)) {
      case (null) { return [] };
      case (?store) {
        let billsArray = store.values().toArray();
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
    };
  };

  public query ({ caller }) func getCompanyReport(partyName : Text, from : Int, to : Int) : async CompanyReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view company reports");
    };

    switch (userBills.get(caller)) {
      case (null) {
        return {
          totalServiceAmount = 0.0;
          totalReceived = 0.0;
          totalPending = 0.0;
          bills = [];
        };
      };
      case (?store) {
        let billsArray = store.values().toArray();

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
    };
  };

  public query ({ caller }) func getProfitLossSummary(from : Int, to : Int) : async ProfitLossSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view profit/loss summary");
    };

    switch (userBills.get(caller)) {
      case (null) {
        return {
          totalBilled = 0.0;
          totalReceived = 0.0;
          totalOutstanding = 0.0;
          profitLossIndicator = false;
        };
      };
      case (?store) {
        let billsArray = store.values().toArray();
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
    };
  };

  // Returns all unique party names from the caller's bills for autocomplete suggestions
  public query ({ caller }) func getUniquePartyNames() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view party names");
    };

    switch (userBills.get(caller)) {
      case (null) { return [] };
      case (?store) {
        let billsArray = store.values().toArray();
        let seen = Map.empty<Text, Bool>();
        for (bill in billsArray.vals()) {
          seen.add(bill.partyName, true);
        };
        seen.keys().toArray();
      };
    };
  };

  // Returns all unique product names from the caller's bills for autocomplete suggestions
  public query ({ caller }) func getUniqueProductNames() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can view product names");
    };

    switch (userBills.get(caller)) {
      case (null) { return [] };
      case (?store) {
        let billsArray = store.values().toArray();
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
  };
};
