import bcrypt from 'bcryptjs';
import {db} from '../../index.js';

export const findUserByChatId = (chatId) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE chatId = ?', [chatId], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

export const getDecryptedPassword = async (chatId) => {
    const user = await findUserByChatId(chatId)

    if (user) {
        const {salt, hashedPassword, username} = user;

        if (hashedPassword.endsWith(salt)) {
            return {
                username: username,
                password: hashedPassword.slice(0, -salt.length),
            }
        }
    }

    return {
        username: null,
        password: null,
    };
}

export const deleteUserByChatId = (chatId) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('DELETE FROM users WHERE chatId = ?');
        stmt.run(chatId, (err) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve();
            }
        });
        stmt.finalize();
    });
}

export const addUser = async (chatId, username, plainPassword) => {
    const salt = String(await bcrypt.genSalt(10));
    const hashedPassword = plainPassword + salt;

    try {
        const existingUser = await findUserByChatId(chatId);

        if (existingUser) {
            await deleteUserByChatId(chatId);
        }

        const stmt = db.prepare(`
            INSERT INTO users (chatId, username, salt, hashedPassword) VALUES (?, ?, ?, ?)
        `);

        await new Promise((resolve, reject) => {
            stmt.run(chatId, username, salt, hashedPassword, (err) => {
                if (err) {
                    console.error('Error inserting into database:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
            stmt.finalize();
        });

    } catch (error) {
        console.error('Error adding user:', error.message);
        throw error;
    }
}

export const updateToken = (chatId, newToken) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare('UPDATE users SET token = ? WHERE chatId = ?');
        stmt.run(newToken, chatId, function (err) {
            stmt.finalize();
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

export const updateGroup = (chatId, newGroup) => {
    const stmt = db.prepare('UPDATE users SET userGroup = ? WHERE chatId = ?');
    stmt.run(newGroup, chatId);
    stmt.finalize();
}

export const addNoPasswordUser = async (chatId, userGroup) => {
    try {
        const existingUser = await findUserByChatId(chatId);

        if (existingUser && existingUser.token) {
            return {success: true, message: 'User already exists with a token.'};
        }

        if (existingUser) {
            await deleteUserByChatId(chatId);
        }

        const stmt = db.prepare(`
            INSERT INTO users (chatId, userGroup) VALUES (?, ?)
        `);

        await new Promise((resolve, reject) => {
            stmt.run(chatId, userGroup, (err) => {
                if (err) {
                    console.error('Error inserting into database:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
            stmt.finalize();
        });

    } catch (error) {
        console.error('Error adding user without password:', error.message);
        throw error;
    }
}

