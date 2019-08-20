const { Rental, validate } = require("../models/rental");
const { Film } = require("../models/film");
const { Customer } = require("../models/customer");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customer.");

  const film = await Film.findById(req.body.filmId);
  if (!film) return res.status(400).send("Invalid film.");

  if (film.numberInStock === 0)
    return res.status(400).send("Film not in stock.");

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    film: {
      _id: film._id,
      title: film.title,
      dailyRentalRate: film.dailyRentalRate
    }
  });
  rental = await rental.save();

  film.numberInStock--;
  film.save();

  res.send(rental);
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental)
    return res.status(404).send("The rental with the given ID was not found.");

  res.send(rental);
});

module.exports = router;
