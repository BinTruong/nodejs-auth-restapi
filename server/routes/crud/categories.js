const express = require("express");
const router = express.Router();

const { MESSAGES } = require("../../../constant");
const BookModel = require("../../../models/book.model.js");
const CategoryModel = require("../../../models/category.model");
const { getSort, getLimit } = require("../../../helper");
const handlerCheckPermission = require("../../middleware/handlerCheckPermission");

/* GET categories listing. */
router.get("/", handlerCheckPermission, async function (req, res) {
  try {
    const categories = await CategoryModel.find();
    return res.json({ categories });

    // const totalDocs = await CategoryModel.countDocuments();
    // const categories = await CategoryModel.find().sort(sort).skip((page - 1) * limit).limit(limit).exec();
    // return res.json({ data: categories, totalDocs, page, limit });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

router.post("/paging", handlerCheckPermission, async function (req, res) {
  try {
    var condition = req.body.condition || {};
    var page = condition.page || 1;
    var limit = getLimit(condition);
    var sort = getSort(condition);

    var options = {
      page: page,
      limit: limit,
      sort: sort,
    };

    const query = {};
    if (condition.keyword) {
      query.$or = [
        { title: { $regex: condition.keyword, $options: "i" } },
        // {userName:{$regex: condition.keyword, $options:'i'}},
        // {firstName:{$regex: condition.keyword, $options:'i'}},
        // {lastname:{$regex: condition.keyword, $options:'i'}},
      ];
    }

    const categories = await CategoryModel.paginate(query, options);
    return res.json({ categories });

    // const totalDocs = await CategoryModel.countDocuments();
    // const categories = await CategoryModel.find().sort(sort).skip((page - 1) * limit).limit(limit).exec();
    // return res.json({ data: categories, totalDocs, page, limit });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* POST categories create. */
router.post("/", handlerCheckPermission, async function (req, res) {
  try {
    const { title } = req.body;
    const categoryExisted = await CategoryModel.findOne({ title });
    if (categoryExisted === null) {
      const categoryModel = new CategoryModel({ title });
      const category = await categoryModel.save();

      return res.json({ code: 200, errorMess: "", data: { category } });
    } else {
      return res.json({ code: 400, errorMess: err, data: null });
    }
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* PUT categories edit. */
router.put("/:_id", handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const { title } = req.body;

    const categoryUpdate = await CategoryModel.updateOne(
      { _id: _id },
      { title }
    ).then(() => {
      return CategoryModel.findById(_id);
    });
    return res.json({ code: 200, errorMess: "", data: { categoryUpdate } });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* DELETE categories delete. */
router.delete("/:_id", handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const category = await CategoryModel.findById(_id);
    if (category) {
      await CategoryModel.deleteOne({ _id: _id });
      await BookModel.deleteMany({ category: _id });
      return res.json({ code: 200, errorMess: "", data: true });
    }
    return res.json({
      code: 400,
      errorMess: MESSAGES.USERNAME_NOT_EXISTED,
      data: false,
    });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: false });
  }
});

export default router;
