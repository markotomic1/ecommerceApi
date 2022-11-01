const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const CryptoJS = require("crypto-js");

const router = require("express").Router();

//Create order

router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);
  try {
    const savedOrder = await newOrder.save();

    return res.status(200).json(savedOrder);
  } catch (error) {
    return res.status(500).json(error);
  }
});
//update order
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// //Delete cart
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    return res.status(200).json("Cart has been deleted");
  } catch (err) {
    return res.status(500).json(err);
  }
});

// get user cart
router.get("/find/:userId", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });

    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
});
// //Get all

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
});

// get Monthly income

router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const prevMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gt: prevMonth } } },
      {
        $project: { month: { $month: "$createdAt" }, sales: "$amount" },
      },
      { $group: { _id: "$month", total: { $sum: "$sales" } } },
    ]);
    return res.status(200).json(income);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

module.exports = router;
