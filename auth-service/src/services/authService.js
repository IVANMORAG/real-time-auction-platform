const User = require('../models/User');
const Session = require('../models/Session');
const { generateToken } = require('../config/jwt');
const { comparePassword } = require('../utils/bcrypt');

class AuthService {
  async register(userData) {
    try {
      // Verificar si el email ya existe
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
      
      // Crear nuevo usuario
      const user = new User(userData);
      await user.save();
      
      // Generar token
      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });
      
      // Crear sesión
      await this.createSession(user._id, token);
      
      return {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }
  
  async login(email, password, userAgent = null, ipAddress = null) {
    try {
      // Buscar usuario con password incluido
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new Error('Credenciales inválidas');
      }
      
      if (!user.isActive) {
        throw new Error('Cuenta desactivada');
      }
      
      // Verificar contraseña
      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Credenciales inválidas');
      }
      
      // Actualizar último login
      user.lastLogin = new Date();
      await user.save();
      
      // Generar token
      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });
      
      // Crear sesión
      await this.createSession(user._id, token, userAgent, ipAddress);
      
      return {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          role: user.role,
          lastLogin: user.lastLogin
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }
  
  async logout(token) {
    try {
      await Session.findOneAndUpdate(
        { token },
        { isActive: false }
      );
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  async validateToken(token) {
    try {
      const session = await Session.findOne({ 
        token, 
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).populate('userId');
      
      return session ? session.userId : null;
    } catch (error) {
      throw error;
    }
  }
  
  async updateProfile(userId, profileData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: { profile: profileData } },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  }
  
  async createSession(userId, token, userAgent = null, ipAddress = null) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas
      
      const session = new Session({
        userId,
        token,
        expiresAt,
        userAgent,
        ipAddress
      });
      
      await session.save();
      return session;
    } catch (error) {
      throw error;
    }
  }
  
  async getUserSessions(userId) {
    try {
      return await Session.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();