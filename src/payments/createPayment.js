import { LightningAddress } from "alby-tools";





export async function testLn() {
    var ln = new LightningAddress("gsovereignty@getalby.com");
    await ln.fetch();
// request an invoice for 1000 satoshis
// this returns a new `Invoice` class that can also be used to validate the payment
    const invoice = await ln.requestInvoice({satoshi: 1000, comment: "test"});

    console.log(invoice.paymentRequest); // print the payment request
    console.log(invoice.paymentHash); // print the payment hash
}