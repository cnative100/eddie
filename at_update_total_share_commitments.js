// Update the total share counts for each share type
let subscribersTable = base.getTable('Subscribers');
let subscriptionsTable = base.getTable('Subscriptions');
let subscribersView = subscribersTable.getView('Grid view');
let subscriptionsView = subscriptionsTable.getView('Grid view');
let shareTypesTable = base.getTable('Share Types and Price List');
let shareTypesView = shareTypesTable.getView('Grid view');
let subscribersResults = await subscribersView.selectRecordsAsync({fields: ['Name','Reserved']});
let subscriptionsResults = await subscriptionsView.selectRecordsAsync({fields: ['Share','Share Price','Frequency (in weeks)','Number of Shares','Subscribers']});
let shareTypesResults = await shareTypesView.selectRecordsAsync({fields: ['Name']});

let occurrences = [52,26,17,13,10,9,7,6];

// For each shareType, go through all the subscriptions and sum up the total shares for
// the year = sub.quantity * (occurrences[sub.frequency-1])
for(let shareType of shareTypesResults.records){
  let runningTotal = 0;
  for(let subscriptionRecord of subscriptionsResults.records){
    if(subscriptionRecord.getCellValueAsString('Share') == shareType.getCellValueAsString('Name')){
      
      let currentSubscriber = subscriptionRecord.getCellValue("Subscribers")[0].name;
      for(let subscriberRecord of subscribersResults.records){
        if(subscriberRecord.getCellValueAsString("Name") == currentSubscriber && subscriberRecord.getCellValueAsString("Reserved") == "Yes"){
          runningTotal += subscriptionRecord.getCellValue('Number of Shares') * occurrences[parseInt(subscriptionRecord.getCellValueAsString('Frequency (in weeks)'))-1];
          continue;
        }
      }
      
    }
  }
  
  await shareTypesTable.updateRecordAsync(shareType.id, {
    "Shares Allocated" : runningTotal,
  })
  
}
