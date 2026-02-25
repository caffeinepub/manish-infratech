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
import Migration "migration";

(with migration = Migration.run)
actor {
  // Initialize access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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

  // Line item type for bill
  public type LineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    amount : Float;
    itemGst : Float;
  };

  // Bill type definition
  public type Bill = {
    partyName : Text;
    invoiceNumber : Text;
    baseAmount : Float;
    cgst : Float;
    sgst : Float;
    totalGst : Float;
    roundOff : Float;
    finalAmount : Float;
    lineItems : [LineItem];
  };

  // Updated mapping to include new Bill structure
  let userBills = Map.empty<Principal, Map.Map<Text, Bill>>();

  // Ensure user has a bill store
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

  public shared ({ caller }) func addBill(
    partyName : Text,
    invoiceNumber : Text,
    lineItems : [LineItem]
  ) : async Bill {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only the owner can add bills");
    };

    let userStore = getOrCreateUserBillStore(caller, true);

    switch (userStore.get(invoiceNumber)) {
      case (?_) { Runtime.trap("Bill with this invoice number already exists") };
      case (null) {};
    };

    // Calculate totals from line items
    var baseAmount : Float = 0.0;
    var totalGst : Float = 0.0;

    let calculatedLineItems = lineItems.map(
      func(item) {
        let itemGst = item.amount * 0.18;
        baseAmount += item.amount;
        totalGst += itemGst;
        { item with itemGst };
      }
    );

    let cgst = totalGst / 2.0;
    let sgst = totalGst / 2.0;
    let finalAmountRaw = baseAmount + totalGst;
    let finalAmountRounded = (finalAmountRaw + 0.5).toInt().toFloat();
    let roundOff = finalAmountRounded - finalAmountRaw;

    let bill : Bill = {
      partyName;
      invoiceNumber;
      baseAmount;
      cgst;
      sgst;
      totalGst;
      roundOff;
      finalAmount = finalAmountRounded;
      lineItems = calculatedLineItems;
    };

    userStore.add(invoiceNumber, bill);
    bill;
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
      case (null) { return []; };
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
      case (null) { return []; };
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
};
