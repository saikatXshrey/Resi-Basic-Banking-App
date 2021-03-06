const withdrawList = document.querySelector('.withdraws');
const form = document.querySelector('#add-withdraw');

// FORM SUBMIT
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let sender_length;
    let sender_name;
    let sender_current_balance;

    // GET data by id of depositer
    await db.collection('Customers').where('id', '==', form.name.value).get().then((snapshot) => {
        sender_length = snapshot.docs.length;
        sender_current_balance = parseInt(snapshot.docs[0].data().balance);
        sender_name = snapshot.docs[0].data().owner;
        console.log(sender_name, sender_current_balance, sender_length);
    }).catch((err) => {
        window.alert('Withdrawer doesnt exist!', err);
        window.location.reload();
    })

    // riya POST data in firestore Transfers collection
    if (sender_length > 0 && sender_current_balance > form.amount.value && form.amount.value > 0) {

        const d = new Date();

        await db.collection('Withdraws').add({
            withdrawer: form.name.value,
            withdrawerName: sender_name,
            amount: form.amount.value,
            date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} & Time - ${d.getHours()}h:${d.getMinutes()}m:${d.getSeconds()}s`,
            timeSnap: Date.now(),
        })

        // update depositer
        updateWithdrawer(form.name.value, form.amount.value);
        // toast message
        // var toast = new bootstrap.Toast(toastLiveExample)
        // toast.show()
    } else {
        window.alert('Error! in Transaction');
    }

    // clear input data
    form.name.value = '';
    form.amount.value = '';
    // window.location.reload();
});

// UPDATE WITHDRAWER
const updateWithdrawer = async (sender, value) => {
    const senderRef = db.collection('Customers').doc(sender);

    try {
        await db.runTransaction(async (t) => {
            const doc = await t.get(senderRef);

            const newBalance = doc.data().balance - Number(value);
            t.update(senderRef, { balance: newBalance });
        });

        console.log('Transaction success!');
    } catch (err) {
        console.log('Transaction failure:', err);
    }
}





// WITHDRAWER RECORD
const renderTransfers = (transfers) => {
    transfers.forEach((transfer) => {

        let li = document.createElement('li');
        let pill = document.createElement('span');
        let sender = document.createElement('span');
        // let receiver = document.createElement('span');
        let amount = document.createElement('span');
        let date = document.createElement('span');
        let block = document.createElement('br');

        sender.textContent = `${transfer.data().withdrawerName} - ${transfer.data().withdrawer}`;
        sender.className = 'lead fst-italic';
        pill.textContent = 'Withdrawed ???';
        pill.className = 'rounded-pill movements__type movements__type--withdrawal';
        // receiver.textContent = `Receiver : ${transfer.data().receiverName} - ${transfer.data().receiver}`;
        // receiver.className = 'lead fst-italic';
        amount.textContent = `Amount : ???${transfer.data().amount}`;
        amount.className = 'lead fst-italic';
        date.textContent = `Date : ${transfer.data().date}`;
        date.className = 'fst-italic';

        li.appendChild(sender);
        li.appendChild(pill);
        // li.appendChild(receiver);
        pill.appendChild(block);
        li.appendChild(amount);
        withdrawList.appendChild(date);
        li.className = 'alert alert-secondary';

        withdrawList.appendChild(li);
        console.log(transfer);
    });
}

// GET transfer record data from firestore(Not REALTIME)
db.collection('Withdraws').orderBy("timeSnap").get().then((snapshot) => {
    renderTransfers(snapshot.docs);
    console.log(snapshot.docs);
})