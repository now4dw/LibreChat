// Fork patch: admin-scoped file lookup.
// Lets the bytepass-proxy resolve a file_id to a file record regardless of
// which user owns it. Used to fetch the /images/... filepath for images
// attached by non-admin users to their chats, so fal.ai edit calls work
// multi-user. Gated by the same ACCESS_ADMIN capability as other admin routes.
const express = require('express');
const { SystemCapabilities } = require('@librechat/data-schemas');
const { requireCapability } = require('~/server/middleware/roles/capabilities');
const { requireJwtAuth } = require('~/server/middleware');
const db = require('~/models');

const router = express.Router();

router.use(requireJwtAuth, requireCapability(SystemCapabilities.ACCESS_ADMIN));

router.get('/:file_id', async (req, res) => {
  try {
    const [file] = await db.getFiles({ file_id: req.params.file_id });
    if (!file) return res.status(404).json({ message: 'file not found' });
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
