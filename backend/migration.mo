import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldBill = {
    partyName : Text;
    invoiceNumber : Text;
    baseAmount : Float;
    cgst : Float;
    sgst : Float;
    totalGst : Float;
    roundOff : Float;
    finalAmount : Float;
  };

  type NewLineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    amount : Float;
    itemGst : Float;
  };

  type NewBill = {
    partyName : Text;
    invoiceNumber : Text;
    baseAmount : Float;
    cgst : Float;
    sgst : Float;
    totalGst : Float;
    roundOff : Float;
    finalAmount : Float;
    lineItems : [NewLineItem];
  };

  type OldActor = {
    userBills : Map.Map<Principal, Map.Map<Text, OldBill>>;
  };

  type NewActor = {
    userBills : Map.Map<Principal, Map.Map<Text, NewBill>>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserBills = old.userBills.map<Principal, Map.Map<Text, OldBill>, Map.Map<Text, NewBill>>(
      func(_p, oldBillMap) {
        oldBillMap.map<Text, OldBill, NewBill>(
          func(_invNum, oldBill) {
            { oldBill with lineItems = [] };
          }
        );
      }
    );
    { userBills = newUserBills };
  };
};
