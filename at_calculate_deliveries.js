// For each subscriber, calculate how many deliveries they'll need for the year. 
// --------------------------
let subscribersTable = base.getTable("Subscribers");
let subscribersView = subscribersTable.getView("Grid view");
let subscriptionsTable = base.getTable("Subscriptions");
let subscriptionsView = subscriptionsTable.getView("Grid view");
let subscriberResults = await subscribersView.selectRecordsAsync({fields: ['Name']});
let subscriptionsResults = await subscriptionsView.selectRecordsAsync({fields: ['Subscribers','Frequency (in weeks)']});

// Updates can only be in batches of 50
let updates = new Array();
let batchSize = 0;
let MAX_BATCH_SIZE = 50;

for(let subscriberRecord of subscriberResults.records){
  let deliverySlots = new Set();
  let subscriberName = subscriberRecord.getCellValue('Name');

  for(let shareRecord of subscriptionsResults.records){
      if(shareRecord.getCellValueAsString('Subscribers') == subscriberName){
          let freqency = parseInt(shareRecord.getCellValueAsString("Frequency (in weeks)"));
          let freqIterator = freqency;
          while(freqIterator <= 52){
            deliverySlots.add(freqIterator);
            freqIterator += freqency;
          }
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
