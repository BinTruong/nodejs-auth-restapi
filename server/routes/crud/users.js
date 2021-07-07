const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const { getSort, getLimit } = require("../../../helper");
const { MESSAGES } = require("../../../constant/index");
const BookModel = require("../../../models/book.model.js");
const UserModel = require("../../../models/user.model.js");
const handlerCheckPermission = require("../../middleware/handlerCheckPermission");

/* GET users listing. */
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
    query.$or = [
      { username: { $regex: condition.keyword, $options: "i" } },
      { firstName: { $regex: condition.keyword, $options: "i" } },
      { lastName: { $regex: condition.keyword, $options: "i" } },
      { role: { $regex: condition.keyword, $options: "i" } },
    ];
    const users = await UserModel.paginate(query, options);
    return res.json({ users });
  } catch (err) {
    return res.json({ code: 400, errorMess: err, data: null });
  }
});

/* POST users create. */
router.post("/", handlerCheckPermission, async function (req, res) {
  try {
    const { username, password, firstName, lastName, role } = req.body;
    const userExisted = await UserModel.findOne({ username });
    if (userExisted === null) {
      const hash = await bcrypt.hash(password, 8);
      const UserClass = new UserModel({
        username,
        password: hash,
        firstName,
        lastName,
        role,
      });
      const user = await UserClass.save();

      return res.json({
        code: 200,
        message: MESSAGES.ADD_USER_SUCCESSFULLY,
        data: { user },
      });
    } else {
      return res.json({ code: 400, message: err, data: null });
    }
  } catch (err) {
    return res.json({ code: 400, message: err, data: null });
  }
});

/* PUT users edit. */
router.put("/:_id", handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const { username, password, firstName, lastName, role } = req.body;
    const payload = { username, firstName, lastName, role };

    if (password) {
      const hash = await bcrypt.hash(password, 8);
      payload.password = hash;
    }

    const userUpdate = await UserModel.updateOne({ _id: _id }, payload).then(
      () => {
        return UserModel.findById(_id);
      }
    );
    return res.json({
      code: 200,
      message: MESSAGES.UPDATE_USER_SUCCESSFULLY,
      data: { userUpdate },
    });
  } catch (err) {
    return res.json({ code: 400, message: err, data: null });
  }
});

/* DELETE users delete. */
router.delete("/:_id", handlerCheckPermission, async (req, res) => {
  try {
    const _id = req.params._id;
    const user = await UserModel.findById(_id);
    // debugger;
    if (user) {
      await UserModel.deleteOne({ _id: _id });
      await BookModel.deleteMany({ owner: _id });
      return res.json({
        code: 200,
        message: MESSAGES.DELETE_USER_SUCCESSFULLY,
        data: true,
      });
    }
    return res.json({
      code: 400,
      message: MESSAGES.USERNAME_NOT_EXISTED,
      data: false,
    });
  } catch (err) {
    return res.json({ code: 400, message: err, data: false });
  }
});

export default router;
