const router = require('express').Router()
const authMiddleware = require('./auth.js')
const { getDocuments, getDocumentsCount, deleteDocument, getDocumentsTotal, getDocumentURL } = require('../controllers/documents')

router.get('/documents', getDocuments)
router.get('/documents/count', authMiddleware, getDocumentsCount)
router.post('/documents/delete', authMiddleware, deleteDocument)
router.post('/documents/total', getDocumentsTotal)
router.post('/documents/url', getDocumentURL)

module.exports = router