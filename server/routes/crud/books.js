const express = require("express");
const router = express.Router();
const { MESSAGES, COVER_PATH } = require("../../../constant");
const BookModel = require("../../../models/book.model");
const CategoryModel = require("../../../models/category.model");
const { getSort, getLimit } = require("../../../helper");
const handlerCheckPermission = require("../../middleware/handlerCheckPermission");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: COVER_PATH });

/* GET book listing. */

router.post("/home", handlerCheckPermission, async function (req, res) {
  try {
    var condition = req.body.condition || {};
    var page = condition.page || 1;
    var limit = getLimit(condition);
    var sort = getSort(condition);

    var options = {
      page: page,
      limit: limit,
      sort: sort,
      populate: [
        { path: "owner", select: "firstName lastName role " },
        { path: "category", select: "title" },
      ],
      // populate: [{ path: "category", select: "title" }],
    };

    const query = {};

    if (condition.filterCategory) {
      query.category = condition.filterCategory;
    }

    if (condition.keyword) {
      const categories = await CategoryModel.find({
        title: { $regex: condition.keyword, $options: "i" },
      });
      const categoriesId = categories.map((item) => item._id);
      query.$or = [
        { title: { $regex: condition.keyword, $options: "i" } },
        { author: { $regex: condition.keyword, $options: "i" } },
        // { "category.title": { $regex: condition.keyword, $options: "i" } },
        { description: { $regex: condition.keyword, $options: "i" } },
        // { owner: { $regex: condition.keyword, $options: "i" } },
      ];
      if (categoriesId.length) {
        query.$or.push({ category: { $in: categoriesId } });
      }
    }

    const books = await BookModel.paginate(query, options);
    return res.json({ books });
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
      populate: [
        { path: "owner", select: "firstName lastName role " },
        { path: "category", select: "title" },
      ],
      // populate: [{ path: "category", select: "title" }],
    };

    const query = {};
    if (req._user.role[0] === "contributor") {
      query.owner = req._user._id;
    }

    if (condition.keyword) {
      const categories = await CategoryModel.find({
        title: { $regex: condition.keyword, $options: "i" },
      });
      const categoriesId = categories.map((item) => item._id);

      query.$or = [
        { title: { $regex: condition.keyword, $options: "i" } },
        { author: { $regex: condition.keyword, $options: "i" } },
        // { "category.title": { $regex: condition.keyword, $options: "i" } },
        { description: { $regex: condition.keyword, $options: "i" } },
        // { owner: { $regex: condition.keyword, $options: "i" } },
      ];

      if (categoriesId.length) {
        query.$or.push({ category: { $in: categoriesId } });
      }
    }

    const books = await BookModel.paginate(query, options);
    return res.json({ books });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* POST book create. */
router.post(
  "/",
  handlerCheckPermission,
  upload.single("cover"),
  async function (req, res) {
    try {
      const filePath = `${COVER_PATH}/${new Date().getTime()}_${
        req.file.originalname
      }`;
      fs.rename(`${COVER_PATH}/${req.file.filename}`, filePath, async (err) => {
        if (err) {
          return res.json({ code: 400, errorMess: err, data: null });
        }
      });
      const { title, description, author, cover, category } = req.body;
      const bookModel = new BookModel({
        title,
        description,
        author,
        owner: req._user._id,
        cover: filePath,
        category,
      });
      const book = await bookModel.save();

      return res.json({ code: 200, errorMess: "", data: { book } });
    } catch (err) {
      return res.json({ code: 400, errorMess: err, data: null });
    }
  }
);

/* PUT book edit. */
router.put(
  "/:_id",
  handlerCheckPermission,
  upload.single("cover"),
  async (req, res) => {
    try {
      const _id = req.params._id;
      const { title, description, author, category } = req.body;

      const book = await BookModel.findById(_id);

      if (req.file) {
        const filePath = `${COVER_PATH}/${new Date().getTime()}_${
          req.file.originalname
        }`;
        fs.unlinkSync(book.cover);
        fs.rename(
          `${COVER_PATH}/${req.file.filename}`,
          filePath,
          async (err) => {
            if (err) {
              return res.json({ code: 400, errorMess: err, data: null });
            }
          }
        );
        const bookUpdate = await BookModel.updateOne(
          { _id: _id },
          { title, description, author, cover: filePath, category }
        ).then(() => {
          return BookModel.findById(_id);
        });
        return res.json({ code: 200, errorMess: "", data: { bookUpdate } });
      }

      const bookUpdate = await BookModel.updateOne(
        { _id: _id },
        { title, description, author, category }
      ).then(() => {
        return BookModel.findById(_id);
      });
      return res.json({ code: 200, errorMess: "", data: { bookUpdate } });
    } catch (err) {
      return res.json({ code: 400, errorMess: err, data: null });
    }
  }
);

/* DELETE book delete. */
router.delete("/:_id", handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const book = await BookModel.findById(_id);
    if (book) {
      await BookModel.deleteOne({ _id: _id });
      return res.json({ code: 200, errorMess: "", data: true });
    }
    return res.json({
      code: 400,
      errorMess: MESSAGES.BOOK_IS_NOT_EXISTED,
      data: false,
    });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: false });
  }
});

//GET Book details
router.get("/:_id", handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const book = await BookModel.findById(_id);
    if (book) {
      return res.json({ book });
    }
    return res.json({
      code: 400,
      errorMess: MESSAGES.BOOK_IS_NOT_EXISTED,
      data: false,
    });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: false });
  }
});

export default router;
