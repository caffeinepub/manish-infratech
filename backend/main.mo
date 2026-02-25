import Map "mo:core/Map";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  public type CompanySettings = {
    companyAddress : Text;
    accountNumber : Text;
    panNumber : Text;
    gstin : Text;
    ifscCode : Text;
    bankName : Text;
  };

  public type LineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    quantity : Float;
    unit : Text;
    rate : Float;
    totalAmount : Float;
  };

  public type PartyProfile = {
    gstNumber : Text;
    address : Text;
  };

  public type Bill = {
    partyName : Text;
    partyGstNo : ?Text;
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
    siteAddress : Text;
  };

  public type BillOperation = {
    partyName : Text;
    partyGstNo : ?Text;
    invoiceNumber : Text;
    billDate : Int;
    lineItems : [LineItem];
    amountPaid : Float;
    siteAddress : Text;
  };

  public type PartySummary = {
    partyName : Text;
    gstNumber : Text;
    address : Text;
    totalBilled : Float;
    totalPaid : Float;
    totalPending : Float;
    billCount : Nat;
  };

  public type CompanyReport = {
    totalServiceAmount : Float;
    totalReceived : Float;
    totalPending : Float;
    bills : [Bill];
  };

  public type ProfitLossSummary = {
    totalBilled : Float;
    totalReceived : Float;
    totalOutstanding : Float;
    profitLossIndicator : Bool;
  };

  let MAX_LINE_ITEMS : Nat = 15;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let partyProfiles = Map.empty<Text, PartyProfile>();
  let bills = Map.empty<Text, Bill>();
  var companySettings : ?CompanySettings = null;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Company settings methods (accessible to authenticated users)
  public shared ({ caller }) func saveCompanySettings(settings : CompanySettings) : async () {
    companySettings := ?settings;
  };

  public query ({ caller }) func getCompanySettings() : async ?CompanySettings {
    companySettings;
  };

  public shared ({ caller }) func savePartyGstNumber(partyName : Text, gstNumber : Text) : async () {
    switch (partyProfiles.get(partyName)) {
      case (?existingProfile) {
        partyProfiles.add(partyName, { existingProfile with gstNumber });
      };
      case (null) {
        partyProfiles.add(
          partyName,
          {
            gstNumber;
            address = "";
          },
        );
      };
    };
  };

  public shared ({ caller }) func savePartyAddress(partyName : Text, address : Text) : async () {
    switch (partyProfiles.get(partyName)) {
      case (?existingProfile) {
        partyProfiles.add(partyName, { existingProfile with address });
      };
      case (null) {
        partyProfiles.add(
          partyName,
          {
            gstNumber = "";
            address;
          },
        );
      };
    };
  };

  public query ({ caller }) func getPartyProfile(partyName : Text) : async PartyProfile {
    switch (partyProfiles.get(partyName)) {
      case (null) {
        {
          gstNumber = "";
          address = "";
        };
      };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func billExists(invoiceNumber : Text) : async Bool {
    bills.containsKey(invoiceNumber);
  };

  public shared ({ caller }) func addBill(billOp : BillOperation) : async Bill {
    if (billOp.lineItems.size() > MAX_LINE_ITEMS) {
      Runtime.trap("Too many line items: maximum allowed is 15");
    };

    switch (bills.get(billOp.invoiceNumber)) {
      case (?_) {
        Runtime.trap("Invoice number '" # billOp.invoiceNumber # "' already exists. Please enter a unique invoice number.");
      };
      case (null) {};
    };

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
      partyGstNo = billOp.partyGstNo;
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
      siteAddress = billOp.siteAddress;
    };

    bills.add(billOp.invoiceNumber, bill);
    bill;
  };

  public shared ({ caller }) func editBill(invoiceNumber : Text, updatedBillOp : BillOperation) : async Bill {
    if (updatedBillOp.lineItems.size() > MAX_LINE_ITEMS) {
      Runtime.trap("Too many line items: maximum allowed is 15");
    };

    switch (bills.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?_) {
        if (updatedBillOp.invoiceNumber != invoiceNumber) {
          switch (bills.get(updatedBillOp.invoiceNumber)) {
            case (?_) {
              Runtime.trap("Invoice number '" # updatedBillOp.invoiceNumber # "' already exists. Please enter a unique invoice number.");
            };
            case (null) {};
          };
        };

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
          partyGstNo = updatedBillOp.partyGstNo;
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
          siteAddress = updatedBillOp.siteAddress;
        };

        if (updatedBillOp.invoiceNumber != invoiceNumber) {
          bills.remove(invoiceNumber);
        };

        bills.add(updatedBillOp.invoiceNumber, updatedBill);
        updatedBill;
      };
    };
  };

  public shared ({ caller }) func deleteBill(invoiceNumber : Text) : async Bill {
    switch (bills.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) {
        bills.remove(invoiceNumber);
        bill;
      };
    };
  };

  public query ({ caller }) func getBill(invoiceNumber : Text) : async Bill {
    switch (bills.get(invoiceNumber)) {
      case (null) { Runtime.trap("Bill not found") };
      case (?bill) { bill };
    };
  };

  public query ({ caller }) func getBillsByParty(partyName : Text) : async [Bill] {
    let allBills = bills.values().toArray();
    allBills.filter(
      func(bill : Bill) : Bool {
        bill.partyName.startsWith(#text partyName);
      }
    );
  };

  public query ({ caller }) func getAllBills() : async [Bill] {
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
    let billsArray = bills.values().toArray();

    let grouped = billsArray.foldLeft(
      Map.empty<Text, PartySummary>(),
      func(acc, bill) {
        let current = switch (acc.get(bill.partyName)) {
          case (null) {
            {
              partyName = bill.partyName;
              gstNumber = switch (partyProfiles.get(bill.partyName)) {
                case (?profile) { profile.gstNumber };
                case (null) { "" };
              };
              address = switch (partyProfiles.get(bill.partyName)) {
                case (?profile) { profile.address };
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
    let billsArray = bills.values().toArray();
    let filteredBills = billsArray.filter(
      func(bill) {
        bill.billDate >= from and bill.billDate <= to
      }
    );

    let grouped = filteredBills.foldLeft(
      Map.empty<Text, PartySummary>(),
      func(acc, bill) {
        let current = switch (acc.get(bill.partyName)) {
          case (null) {
            {
              partyName = bill.partyName;
              gstNumber = switch (partyProfiles.get(bill.partyName)) {
                case (?profile) { profile.gstNumber };
                case (null) { "" };
              };
              address = switch (partyProfiles.get(bill.partyName)) {
                case (?profile) { profile.address };
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
    let billsArray = bills.values().toArray();
    let seen = Map.empty<Text, Bool>();
    for (bill in billsArray.vals()) {
      seen.add(bill.partyName, true);
    };
    seen.keys().toArray();
  };

  // Returns all unique product names from the bills for autocomplete suggestions
  public query ({ caller }) func getUniqueProductNames() : async [Text] {
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
