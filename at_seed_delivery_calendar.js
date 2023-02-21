// Seed dates in the delivery calendar, Tuesday thru Friday each week of the year.
// --------------------------

let deliveryCalendarTable = base.getTable("Delivery Calendar");
let deliveryCalendarView = deliveryCalendarTable.getView("Grid view");

let deliveryCalendarResults = await deliveryCalendarView.selectRecordsAsync({fields: ['Delivery Weekend','Subscriptions']});
let deliveryStartDate = new Date("April 11, 2023");
let deliveryIterator = new Date(deliveryStartDate);

for(let i = 0; i < 52; i++){
  
  for(let j = 0; j < 4; j++){

    let recordId = await deliveryCalendarTable.createRecordAsync({
      "Delivery Weekend": new Date(deliveryIterator)
    });

    deliveryIterator.setDate(deliveryIterator.getDate() + 1);
  }

  deliveryIterator.setDate(deliveryIterator.getDate() + 3);
}
