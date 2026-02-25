import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Float "mo:core/Float";
import Int "mo:core/Int";

module {
  type UserProfile = {
    name : Text;
  };

  type LineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    quantity : Float;
    unit : Text;
    rate : Float;
    totalAmount : Float;
  };

  type BillOld = {
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

  type BillNew = {
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

  type PartyProfile = {
    gstNumber : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userBills : Map.Map<Principal, Map.Map<Text, BillOld>>;
    partyGstNumbers : Map.Map<Text, PartyProfile>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    userBills : Map.Map<Principal, Map.Map<Text, BillNew>>;
    partyGstNumbers : Map.Map<Text, PartyProfile>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
