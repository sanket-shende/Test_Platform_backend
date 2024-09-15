import Router from 'express'
import { createTest, createSubTest, getAllTest, checkTest, solveTest, showTest } from '../controllers/test.controller.js'

const router = Router()

router.route("/create").post(createTest)
router.route("/subtest-create").post( createSubTest )
router.route("/getalltest").post( getAllTest )
router.route("/:id/solve-test").post( solveTest )
router.route("/:id/show-test").post( showTest )
router.route("/:id/check-test").post( checkTest )

export default router