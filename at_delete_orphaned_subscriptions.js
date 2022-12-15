// Delete all subscriptions no longer attached to a 
// subscriber, or where the value is zero
let subscriptionsTable = base.getTable('Subscriptions');
let subscriptionsView = subscriptionsTable.getView('Grid view');

let subscriptionsResults = await subscriptionsView.selectRecordsAsync({fields: ['Subscribers','Monthly Rate','Number of Shares']});
for(let shareRecord of subscriptionsResults.records){
  if(shareRecord.getCellValueAsString('Subscribers').length == 0 || shareRecord.getCellValue('Number of Shares') == 0){
    await subscriptionsTable.deleteRecordAsync(shareRecord.id);
  }
}
