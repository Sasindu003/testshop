const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to validate name (letters & spaces, 2-50 chars)
const isValidName = (name) => {
  return /^[a-zA-Z\s]{2,50}$/.test(name ? name.trim() : '');
};

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ? email.trim() : '');
};

// Helper to validate password security criteria (Minimum 3 out of 4 criteria)
const isSecurePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required.' };
  
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  if (score < 3) {
    return { valid: false, message: 'Password must satisfy at least 3 security requirements (Min 8 chars, 1 uppercase, 1 digit, or 1 special symbol).' };
  }
  return { valid: true };
};

// Helper to validate real phone number format
const isValidPhoneNumber = (phone) => {
  if (!phone) return true;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+?[1-9]\d{8,14}|(?:\+94|0)?7[0-9]{8})$/;
  return phoneRegex.test(cleaned);
};

const memoryUsers = [
  {
    _id: 'usr_admin',
    name: 'Demo Admin',
    email: 'admin@stylehub.com',
    passwordHash: bcrypt.hashSync('AdminStyle#2026', 10),
    role: 'admin',
    phone: '+94 77 123 4567',
    secondaryPhone: '+94 11 234 5678',
    isActive: true,
    addresses: [],
    createdAt: new Date()
  },
  {
    _id: 'usr_staff',
    name: 'Staff Member',
    email: 'staff@stylehub.com',
    passwordHash: bcrypt.hashSync('StaffStyle#2026', 10),
    role: 'staff',
    phone: '+94 71 987 6543',
    secondaryPhone: '',
    isActive: true,
    addresses: [],
    createdAt: new Date()
  },
  {
    _id: 'usr_customer',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    passwordHash: bcrypt.hashSync('SarahStyle#2026', 10),
    role: 'customer',
    phone: '+94 70 555 1212',
    secondaryPhone: '+94 11 555 9999',
    isActive: true,
    addresses: [
      {
        _id: 'addr_default',
        street: '45 Galle Road',
        city: 'Colombo 03',
        state: 'Western Province',
        zipCode: '00300',
        country: 'Sri Lanka',
        isDefault: true
      }
    ],
    createdAt: new Date()
  }
];

const generateToken = (id, email, role) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || 'stylehub_super_secret_jwt_key_2026_fashion_shop',
    { expiresIn: '7d' }
  );
};

// @desc    Check if email already exists
// @route   POST /api/auth/check-email
const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid Email Address format.' });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.json({ exists: true, message: 'User with this email already exists.' });
      }
      return res.json({ exists: false });
    } else {
      const existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        return res.json({ exists: true, message: 'User with this email already exists.' });
      }
      return res.json({ exists: false });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, secondaryPhone, address } = req.body;

    if (!name || !isValidName(name)) {
      return res.status(400).json({ success: false, message: 'Invalid Full Name: Name must contain only letters and spaces (min 2 characters).' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid Email Address format. Please enter a valid email (e.g. name@example.com).' });
    }

    const passCheck = isSecurePassword(password);
    if (!passCheck.valid) {
      return res.status(400).json({ success: false, message: passCheck.message });
    }

    if (phone && secondaryPhone && phone.trim() === secondaryPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Primary Mobile Phone and Secondary Phone cannot be the same number.' });
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid Primary Phone format.' });
    }

    if (secondaryPhone && !isValidPhoneNumber(secondaryPhone)) {
      return res.status(400).json({ success: false, message: 'Invalid Secondary Phone format.' });
    }

    const userRole = role === 'admin' || role === 'staff' ? role : 'customer';

    if (mongoose.connection.readyState === 1) {
      let existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const initialAddresses = address ? [{ ...address, isDefault: true }] : [];

      const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: userRole,
        phone: phone ? phone.trim() : '',
        secondaryPhone: secondaryPhone ? secondaryPhone.trim() : '',
        addresses: initialAddresses
      });

      const token = generateToken(user._id, user.email, user.role);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: { 
          id: user._id, name: user.name, email: user.email, role: user.role, 
          phone: user.phone, secondaryPhone: user.secondaryPhone, addresses: user.addresses 
        }
      });
    } else {
      let existing = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const newUser = {
        _id: 'usr_' + Date.now(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: bcrypt.hashSync(password, 10),
        role: userRole,
        phone: phone ? phone.trim() : '',
        secondaryPhone: secondaryPhone ? secondaryPhone.trim() : '',
        addresses: address ? [{ _id: 'addr_' + Date.now(), ...address, isDefault: true }] : [],
        createdAt: new Date()
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.email, newUser.role);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: { 
          id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, 
          phone: newUser.phone, secondaryPhone: newUser.secondaryPhone, addresses: newUser.addresses 
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address format.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Please enter your password.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials: Email or password incorrect.' });
      }

      if (user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { 
          id: user._id, name: user.name, email: user.email, role: user.role, 
          phone: user.phone, secondaryPhone: user.secondaryPhone, addresses: user.addresses,
          isActive: user.isActive 
        }
      });
    } else {
      const user = memoryUsers.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ success: false, message: 'Invalid credentials: Email or password incorrect.' });
      }

      if (user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'Login successful',
        token,
        user: { 
          id: user._id, name: user.name, email: user.email, role: user.role, 
          phone: user.phone, secondaryPhone: user.secondaryPhone, addresses: user.addresses,
          isActive: user.isActive 
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find(u => u._id === req.user.id || u.email === req.user.email);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { passwordHash, ...userClean } = user;
      return res.json({ success: true, user: userClean });
    }
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { name, phone, secondaryPhone } = req.body;

    if (name && !isValidName(name)) {
      return res.status(400).json({ success: false, message: 'Name can only contain letters and spaces.' });
    }

    if (phone && secondaryPhone && phone.trim() === secondaryPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Primary Mobile Phone and Secondary Phone cannot be the same number.' });
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return res.status(400).json({ success: false, message: 'Primary phone number format is invalid.' });
    }
    if (secondaryPhone && !isValidPhoneNumber(secondaryPhone)) {
      return res.status(400).json({ success: false, message: 'Secondary phone number format is invalid.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (secondaryPhone !== undefined) user.secondaryPhone = secondaryPhone.trim();

      const updatedUser = await user.save();
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: { 
          id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, 
          phone: updatedUser.phone, secondaryPhone: updatedUser.secondaryPhone, addresses: updatedUser.addresses 
        }
      });
    } else {
      const idx = memoryUsers.findIndex(u => u._id === req.user.id || u.email === req.user.email);
      if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) memoryUsers[idx].name = name.trim();
      if (phone !== undefined) memoryUsers[idx].phone = phone.trim();
      if (secondaryPhone !== undefined) memoryUsers[idx].secondaryPhone = secondaryPhone.trim();

      const { passwordHash, ...userClean } = memoryUsers[idx];
      return res.json({ success: true, message: 'Profile updated successfully', user: userClean });
    }
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords.' });
    }

    const checkNew = isSecurePassword(newPassword);
    if (!checkNew.valid) {
      return res.status(400).json({ success: false, message: checkNew.message });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id);
      if (!user || !(await user.matchPassword(currentPassword))) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password changed successfully.' });
    } else {
      const user = memoryUsers.find(u => u._id === req.user.id || u.email === req.user.email);
      if (!user || !bcrypt.compareSync(currentPassword, user.passwordHash)) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }

      user.passwordHash = bcrypt.hashSync(newPassword, 10);
      return res.json({ success: true, message: 'Password changed successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;
    if (!street || !city) return res.status(400).json({ success: false, message: 'Street and City are required.' });

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (isDefault) user.addresses.forEach(a => a.isDefault = false);
      user.addresses.push({ street, city, state, zipCode, country: country || 'Sri Lanka', isDefault: isDefault || false });
      await user.save();
      return res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
    } else {
      const user = memoryUsers.find(u => u._id === req.user.id || u.email === req.user.email);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (isDefault) user.addresses.forEach(a => a.isDefault = false);
      user.addresses.push({ _id: 'addr_' + Date.now(), street, city, state, zipCode, country: country || 'Sri Lanka', isDefault: isDefault || false });
      return res.status(201).json({ success: true, message: 'Address added', addresses: user.addresses });
    }
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const addr = user.addresses.id(addressId);
      if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

      if (isDefault) user.addresses.forEach(a => a.isDefault = false);
      if (street) addr.street = street;
      if (city) addr.city = city;
      if (state) addr.state = state;
      if (zipCode) addr.zipCode = zipCode;
      if (country) addr.country = country;
      if (isDefault !== undefined) addr.isDefault = isDefault;

      await user.save();
      return res.json({ success: true, message: 'Address updated', addresses: user.addresses });
    } else {
      const user = memoryUsers.find(u => u._id === req.user.id || u.email === req.user.email);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const addr = user.addresses.find(a => a._id === addressId);
      if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });

      if (isDefault) user.addresses.forEach(a => a.isDefault = false);
      if (street) addr.street = street;
      if (city) addr.city = city;
      if (state) addr.state = state;
      if (zipCode) addr.zipCode = zipCode;
      if (country) addr.country = country;
      if (isDefault !== undefined) addr.isDefault = isDefault;

      return res.json({ success: true, message: 'Address updated', addresses: user.addresses });
    }
  } catch (error) {
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const customers = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: customers.length, customers });
    } else {
      const customers = memoryUsers.map(({ passwordHash, ...rest }) => rest);
      return res.json({ success: true, count: customers.length, customers });
    }
  } catch (error) {
    next(error);
  }
};

// Expose memoryUsers for userController fallback path
const _getMemoryUsers = () => memoryUsers;

module.exports = {
  checkEmail,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  addAddress,
  updateAddress,
  getAllCustomers,
  _getMemoryUsers
};
