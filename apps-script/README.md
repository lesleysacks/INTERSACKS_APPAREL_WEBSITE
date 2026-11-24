# InterSacks order log (Google Apps Script + Google Sheet)

Customers still send their order and pay on WhatsApp, exactly as before. At the same moment, the website sends a copy of the order to this script, and the script writes it into a Google Sheet. That gives you one list of every order and quote request, with a **Status** column you update yourself.

| Tab | One row per | Columns |
|---|---|---|
| **Orders** | order | Received, Ref, Name, Delivery area, Items, Pieces, Discount (R), Total shown (R), Payment, Due now (R), Balance (R), **Status**, Notes |
| **Order lines** | garment in an order | Ref, Garment, Product code, Colour, Size, Prints, Design codes, Qty, Unit price, Line total, **Preview**, **Image** |
| **Custom enquiries** | quote request | Received, Ref, Name, Occasion, Garment, Quantity, Needed by, Text to print, Notes, **Status** |

- **Status for orders:** New → Deposit paid or Paid in full → In production → Ready → Delivered (or Cancelled).
- **Payment** is what the customer chose in the bag: **50% deposit** or **Pay in full**. **Due now** is what to ask for first; **Balance** is due before dispatch or collection.
- **Status for quote requests:** New → Quoted → Accepted / Declined.
- **Discount (R)** is the Family Kit discount: 4 or more tees with the same front design (adult and kids sizes mixed) get 10% off, 6 or more get 15% off. Total shown is after the discount.
- **Codes:** every design has a permanent code like `IS-D051` and every ready-made piece one like `IS-P03`. Customers see the same codes on the website, in the bag and in their WhatsApp message.
- **Preview** is an "Open build" link that opens the customer's exact tee on the website: colour, size and every print. **Image** shows the main artwork, or the product photo, right in the row. Only links to the InterSacks website are turned into links or pictures.
- The **Ref** (e.g. `IS-261123-7KQ2`) is the same reference the customer sends you on WhatsApp, so you can match the chat to the row.

## Taking payment on WhatsApp

The website never takes money. Each order message ends with the customer's choice, for example:

> Payment: 50% deposit (R628 now, R628 before dispatch)
> Please send EFT details or a payment link. I'll use IS-261124-7KQ2 as the reference.

Save these two **quick replies** in WhatsApp Business (Settings → Business tools → Quick replies). Fill in your business bank details there, once. They never go on the website.

**`/eft`**

```
Thanks for your InterSacks order! To lock it in, please pay R___ by EFT to:
Account name: [business name]
Bank: [bank]
Account no: [number]
Branch code: [code]
Reference: [order ref, e.g. IS-261124-7KQ2]
Please send proof of payment here. Your deposit starts printing; custom prints can't be refunded once printing starts. The balance is due before dispatch or collection.
```

**`/paylink`**

```
Thanks for your InterSacks order! Here's your secure payment link for R___ (order [ref]): [link]
Your deposit starts printing; custom prints can't be refunded once printing starts. The balance is due before dispatch or collection.
```

Make the payment link for the exact amount in your Yoco, SnapScan or PayFast app.

**Then in the sheet:**
1. The deposit lands, so set Status to **Deposit paid** and start printing.
2. The order is ready, so send the balance request using the same quick reply with the Balance amount.
3. The balance lands, so set it to **Paid in full**, then **Ready** / **Delivered**.

An order paid in full goes straight to **Paid in full**.

## Set it up (about 5 minutes)

1. Go to [sheets.new](https://sheets.new) and name the sheet, e.g. **InterSacks Orders**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete what's in `Code.gs`, then paste in everything from [`Code.gs`](Code.gs) in this folder, and click **Save** 💾.
4. In the function drop-down at the top, choose **setup**, then click **Run**.
   - Google asks you to authorise: **Review permissions** → pick your account → **Advanced** → **Go to (project name)** → **Allow**.
   - The three tabs appear in your sheet.
5. Click **Deploy → New deployment**.
   - Next to *Select type*, click the gear ⚙ and choose **Web app**.
   - **Execute as:** Me.
   - **Who has access:** Anyone. The website's customers need to be able to post orders to it.
   - Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
6. Check it works: open that URL in your browser. You should see `"InterSacks order log is running."`
7. Send the `/exec` URL to Claude. Claude puts it in the website (`orderLogUrl` in `src/data/catalogue.js`) and opens a pull request. Once it's merged, every new order lands in the sheet.

## Good to know

- **Payment doesn't change.** The website never takes money. Totals in the sheet are what the customer saw, so confirm them on WhatsApp as usual.
- **If the sheet is ever unavailable,** the order still goes to WhatsApp. Logging never blocks a customer.
- **Privacy.** The sheet holds customers' names and delivery areas. Keep it shared only with people who handle orders. Once logging is on, the website tells customers that a copy is kept.
- **Changing the script later:** paste the new code, then go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The `/exec` URL stays the same.
- **Moving to a business Google account:** make a copy of the sheet in that account and repeat steps 2–7. The website then needs the new `/exec` URL.
- **Spam:** the script only accepts properly formed orders, limits text lengths, ignores repeated references and stops formulas being written into the sheet.
- **Tests:** `npm test` runs `tests/apps-script.test.js`, which checks this script against a stand-in sheet.
