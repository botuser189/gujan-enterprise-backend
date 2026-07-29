const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendQuoteMail = async (quote) => {

    const products = quote.selectedProducts
        .map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.brand || "N/A"}</td>
                <td>${item.sku || "N/A"}</td>
                <td>${item.quantity}</td>
            </tr>
        `)
        .join("");

    await transporter.sendMail({

        from: `"Gujan Enterprises" <${process.env.EMAIL_USER}>`,

        to: process.env.RECEIVER_EMAIL,

        subject: "New Quote Request",

        html: `
        <h2>New Quote Request</h2>

        <table border="1" cellpadding="8" cellspacing="0" width="100%">
            <tr>
                <th align="left">Customer Name</th>
                <td>${quote.customerName}</td>
            </tr>

            <tr>
                <th align="left">Company</th>
                <td>${quote.companyName}</td>
            </tr>

            <tr>
                <th align="left">Phone</th>
                <td>${quote.phone}</td>
            </tr>

            <tr>
                <th align="left">Email</th>
                <td>${quote.email}</td>
            </tr>

            <tr>
                <th align="left">Location</th>
                <td>${quote.location}</td>
            </tr>

            <tr>
                <th align="left">Message</th>
                <td>${quote.message}</td>
            </tr>
        </table>

        <br>

        <h3>Requested Products</h3>

        <table border="1" cellpadding="8" cellspacing="0" width="100%">
            <tr>
                <th>#</th>
                <th>Product</th>
                <th>Brand</th>
                <th>SKU</th>
                <th>Qty</th>
            </tr>

            ${products}

        </table>
        `
    });

};

module.exports = sendQuoteMail;