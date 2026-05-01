import {Router} from 'express'
import { createProblem, getAllProblems, getProblemById, updateProblemStatus, deleteProblem, selectSolutionForProblem, requestCompletion, approveCompletion, getMyProblems } from '../controllers/problemController.js'

const router = Router()

router.post('/create', createProblem)

router.get('/user', getMyProblems);
router.get('/', getAllProblems)
router.get('/:id', getProblemById)

router.patch('/status/:id', updateProblemStatus)
router.patch('/select-solution/:id', selectSolutionForProblem)
router.patch('/request-completion/:id', requestCompletion)
router.patch('/approve-completion/:id', approveCompletion)

router.delete('/delete/:id', deleteProblem)

export default router