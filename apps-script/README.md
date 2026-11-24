# InterSacks order log (Google Apps Script + Google Sheet)

Customers still send their order and pay on WhatsApp, exactly as before. At the same moment, the website sends a copy of the order to this script, and the script writes it into a Google Sheet. That gives you one list of every order and quote request, with a **Status** column you update yourself.

| Tab | One row per | Columns |
|---|---|---|
| **Orders** | order | Received, Ref, Name, Delivery area, Items, Pieces, Total shown (R), **Status**, Notes |
| **Order lines** | garment in an order | Ref, Garment, Product code, Colour, Size, Prints, Design codes, Qty, Unit price, Line total, **Preview**, **Image** |
| **Custom enquiries** | quote request | Received, Ref, Name, Occasion, Garment, Quantity, Needed by, Text to print, Notes, **Status** |

- **Status for orders:** New → Paid → In production → Ready → Delivered (or Cancelled).
- **Status for quote requests:** New → Quoted → Accepted / Declined.
- **Codes:** every design has a permanent code like `IS-D051` and every ready-made piece one like `IS-P03`. Customers see the same codes on the website, in the bag and in their WhatsApp message.
- **Preview** is an "Open build" link that opens the customer's exact tee on the website: colour, size and every print. **Image** shows the main artwork, or the product photo, right in the row. Only links to the InterSacks website are turned into links or pictures.
- The **Ref** (e.g. `IS-261123-7KQ2`) is the same reference the customer sends you on WhatsApp, so you can match the chat to the row.

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
