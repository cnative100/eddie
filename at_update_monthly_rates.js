// For each subscriber, sum up the Monthly Rate for each linked record
// in the Subscriptions table and set that sum as Subscribers.Monthly Bill
let subscriberTable = base.getTable('Subscribers');
let subscriberView = subscriberTable.getView('Grid view');

let subscriptionsTable = base.getTable('Subscriptions');
let subscriptionsView = subscriptionsTable.getView('Grid view');

let subscriberResult = await subscriberView.selectRecordsAsync({fields: ['Name','Share Selections']});
let subscriptionsResults = await subscriptionsView.selectRecordsAsync({fields: ['Subscribers','Monthly Rate']});

for (let subscriberRecord of subscriberResult.records) {
    let subscriberName = subscriberRecord.getCellValue('Name');
    let runningTotal = 0;

    for(let shareRecord of subscriptionsResults.records){
        if(shareRecord.getCellValueAsString('Subscribers') == subscriberName){
            runningTotal += shareRecord.getCellValue("Monthly Rate");
        }
    }
    
    await subscriberTable.updateRecordAsync(subscriberRecord, {
        'Monthly Bill Rate': runningTotal,
    });
}
