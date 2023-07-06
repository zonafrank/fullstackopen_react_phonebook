const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /^\d{2}-\d{6,}$|^\d{3}-\d{5,}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number`
    },
    required: [true, "phone number is required"]
  }
});

personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model("Person", personSchema);
