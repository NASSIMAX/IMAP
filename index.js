const Imap = require("imap");
const { simpleParser } = require("mailparser");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const imapConfig = {
  user: "nassimax001@outlook.com",
  password: "Nassim****",
  host: "outlook.office365.com",
  port: 993,
  tls: true,
};

const getEmails = () => {
  try {
    const imap = new Imap(imapConfig);
    imap.once("ready", () => {
      imap.openBox("INBOX", false, () => {
        imap.search(["ALL", ["NEW", new Date()]], (err, results) => {
          if (err) {
            console.log(err);
            return;
          }
          if (!results || !results.length) {
            console.log("No unread mails");
            imap.end();
            return;
          }
          const f = imap.fetch(results, { bodies: "TEXT" });
          f.on("message", (msg) => {
            msg.on("body", (stream) => {
              simpleParser(stream, async (err, parsed) => {
                const { text } = parsed;
                console.log(parsed);
                /* Make API call to save the data
                   Save the retrieved data into a database.
                   E.t.c
                */
              });
            });
            msg.once("attributes", (attrs) => {
              const { uid } = attrs;
              imap.addFlags(uid, ["\\Unseen"], () => {
                // Mark the email as read after reading it
                console.log("Marked as read!");
              });
            });
          });
          f.once("error", (ex) => {
            return Promise.reject(ex);
          });
          f.once("end", () => {
            console.log("Done fetching all messages!");
            imap.end();
          });
        });
      });
    });

    imap.once("error", (err) => {
      console.log(err);
    });

    imap.once("end", () => {
      console.log("Connection ended");
    });

    imap.connect();
  } catch (ex) {
    console.log("an error occurred");
  }
};

getEmails();
