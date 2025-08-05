const sendMail = require("../helper/emailHelper");
const {mailHTML} = require("../helper/mailHTML");
const { ContactModel } = require("../models")

/**
 * save contact data to database and send http response
 * @param {*} req  -http request
 * @param {*} res -http response
 */
const saveContact = async (req, res) => {
  try {
    const data = req.body;
    const { name, from, message } = data;

    const contact = new ContactModel(data);
    const result = await contact.save();
    const subject = `New contact message from ${name}`
    const mainInfo = await sendMail({
      from,
      to: process.env.EMAIL, // recipient email
      subject: subject,
      text: `From: ${from}\n\nMessage:\n${message}`,
      html: mailHTML(name,subject,from,message),
    });
    res.status(200).json({ message: "Email sent successfully", contact: result.toObject({ versionKey: false }) });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await ContactModel.find({})
    const cleanedContact = contacts.map((contact) => contact.toObject({ versionKey: false }))
    res.status(200).json({ contacts: cleanedContact })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

const getContact = async (req, res) => {
  try {
    const id = req.params.id
    const contact = await ContactModel.find(id)
    const cleanedContact = contact.toObject({ versionKey: false })
    res.status(200).json({ contact: cleanedContact })
  } catch (error) {
    res.status(500).send(error.message)
  }
}

const updateContact = async (req, res) => {
  try {
    const newContact = req.body;
    const id = req.params.id
    const result = await ContactModel.findByIdAndUpdate(id, newContact, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact updated", contact: result.toObject({ versionKey: false }) });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const deleteContact = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await ContactModel.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted", id });
  } catch (error) {
    res.status(500).send(error.message);
  }
};



module.exports = {
  saveContact,
  getContact,
  deleteContact,
  updateContact,
  getContacts
}