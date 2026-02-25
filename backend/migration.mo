import Map "mo:core/Map";

module {
  type LineItem = {
    srNo : Nat;
    hsnCode : Text;
    productName : Text;
    quantity : Float;
    unit : Text;
    rate : Float;
    totalAmount : Float;
  };

  type CompanySettings = {
    companyAddress : Text;
    accountNumber : Text;
    panNumber : Text;
    gstin : Text;
    ifscCode : Text;
    bankName : Text;
  };

  type OldBill = {
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

  type PartyProfile = {
    gstNumber : Text;
    address : Text;
  };

  type OldActor = {
    companySettings : ?CompanySettings;
    bills : Map.Map<Text, OldBill>;
    partyProfiles : Map.Map<Text, PartyProfile>;
  };

  type NewBill = {
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

  type NewActor = {
    companySettings : ?CompanySettings;
    bills : Map.Map<Text, NewBill>;
    partyProfiles : Map.Map<Text, PartyProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newBills = old.bills.map<Text, OldBill, NewBill>(
      func(_id, oldBill) { oldBill }
    );
    { old with bills = newBills };
  };
};
