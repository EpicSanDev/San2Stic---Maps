const bcrypt = require('bcryptjs');
const { User, Recording } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'email', 'role'] });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByPk(req.user.id);
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserRecordings = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const recordings = await Recording.findAll({
      where: { userId: userId },
      // Vous pouvez ajouter des options ici, comme l'ordre, les attributs à inclure, etc.
      // par exemple : order: [['createdAt', 'DESC']]
    });

    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};