// Generate the delivery calendar. Note: MUST DELETE THE SUBSCRIPTIONS FIELD FROM THE DELIVERY CALENDAR TABLE FOR THIS TO WORK!
// --------------------------

let subscribersTable = base.getTable("Subscribers");
let subscribersView = subscribersTable.getView("Grid view");

let subscriptionsTable = base.getTable("Subscriptions");
let subscriptionsView = subscriptionsTable.getView("Grid view");

let deliveryCalendarTable = base.getTable("Delivery Calendar");
let deliveryCalendarView = deliveryCalendarTable.getView("Grid view");

let subscriberResults = await subscribersView.selectRecordsAsync({fields: ['Name', 'Route', 'Segment']});
let subscriptionsResults = await subscriptionsView.selectRecordsAsync({fields: ['Subscribers','Frequency (in weeks)']});
let deliveryCalendarResults = await deliveryCalendarView.selectRecordsAsync({fields: ['Delivery Weekend','Subscriptions']});

let deliveryStartDate = new Date("April 11, 2023");

// Updates can only be in batches of 50
let updates = new Array();
let batchSize = 0;
let MAX_BATCH_SIZE = 50;

for(let subscriberRecord of subscriberResults.records){

  let deliverySlots = new Set();
  let subscriberName = subscriberRecord.getCellValue('Name');
  let route = subscriberRecord.getCellValueAsString('Route');
  let segment = subscriberRecord.getCellValueAsString('Segment');

  for(let shareRecord of subscriptionsResults.records){

      if(shareRecord.getCellValueAsString('Subscribers') == subscriberName){

          let freqency = parseInt(shareRecord.getCellValueAsString("Frequency (in weeks)"));
          let freqIterator = 1;
          let deliveryIterator = new Date(deliveryStartDate);
          let routeIncrement = (route == "CVL" ? 0 : (route == "RVA" ? 1 : (route == "NOVA" ? 2 : (route == "DC") ? 3 : 0)));

          deliveryIterator.setDate(deliveryIterator.getDate() + routeIncrement);
          if(segment == "EAST"){
            deliveryIterator.setDate(deliveryIterator.getDate() + 7);
          }

          let newDeliveries = new Array();
          let interiorBatchSize = 0;
          
          while(freqIterator <= 52){
            

            deliverySlots.add(freqIterator);
            
            for(let iter = 0; iter < deliveryCalendarResults.records.length; iter++){
              if(deliveryCalendarResults.records[iter].getCellValueAsString("Delivery Weekend") ==
                 deliveryIterator.toLocaleDateString('en-us', {year:"numeric", month:"long", day:"numeric"})){
              
                   let deliveryDate = await deliveryCalendarView.selectRecordAsync(deliveryCalendarResults.records[iter].id);

                   if(deliveryDate != null){
                     
                     let existingSubs = deliveryDate.getCellValue("Subscriptions");
                     let newSubsArr = new Array();

                     if(existingSubs){
                      for(let i = 0; i < existingSubs.length; i++){
                        newSubsArr.push({"id": existingSubs[i].id});
                      }
                     }
                     newSubsArr.push({ "id": shareRecord.id });
                     
                     newDeliveries.push({id: deliveryDate.id, fields: {"Subscriptions": newSubsArr}});
                     interiorBatchSize++;

                     if(interiorBatchSize == 50){
                       await deliveryCalendarTable.updateRecordsAsync(newDeliveries);
                       interiorBatchSize = 0;
                       newDeliveries = new Array();
                     }
                   }

                   continue;
              }
            }

            freqIterator += freqency;
            deliveryIterator.setDate(deliveryIterator.getDate() + (freqency*7)); 
          }

          await deliveryCalendarTable.updateRecordsAsync(newDeliveries);
          newDeliveries = new Array();

      }
  }

  updates.push({id: subscriberRecord.id, fields: {"Scheduled Deliveries": deliverySlots.size}});
  batchSize++;

  if(batchSize == MAX_BATCH_SIZE){
    await subscribersTable.updateRecordsAsync(updates);
    updates = new Array();
    batchSize = 0;
  }
  
}

await subscribersTable.updateRecordsAsync(updates);
