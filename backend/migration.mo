import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  // Types from the original actor.
  type UserProfile = { name : Text };
  type PartyProfile = { gstNumber : Text };
  type LineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    quantity : Float;
    unit : Text;
    rate : Float;
    totalAmount : Float;
  };
  type Bill = {
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

  // Actor state before migration.
  type OldActor = {
    MAX_LINE_ITEMS : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    partyGstNumbers : Map.Map<Text, PartyProfile>;
    bills : Map.Map<Text, Bill>;
  };

  // Actor state after migration.
  type NewActor = OldActor;

  // Migration function called by the main actor via the with-clause.
  public func run(old : OldActor) : NewActor { old };
};
