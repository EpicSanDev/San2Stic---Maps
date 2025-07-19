const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt'); // Utilisation de la fonction spécifique
const User = require('../models/user');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Le hachage du mot de passe est géré par le hook beforeCreate du modèle User
    const newUser = await User.create({
      email,
      password,
      // Le rôle par défaut 'user' est défini dans le modèle
    });

    const token = generateToken({ id: newUser.id, role: newUser.role });
    
    // Renvoyer les informations utilisateur sans le mot de passe
    const userResponse = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      reputation: newUser.reputation,
      registrationTimestamp: newUser.registrationTimestamp
    };
    
    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error signing up user.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Utilisation de la méthode d'instance validPassword
    const isMatch = await user.validPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken({ id: user.id, role: user.role });
    
    // Renvoyer les informations utilisateur sans le mot de passe
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      reputation: user.reputation,
      registrationTimestamp: user.registrationTimestamp
    };
    
    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in user.', error: error.message });
  }
};