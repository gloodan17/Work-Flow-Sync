const userService = require('../services/userService');

exports.registerUser = async (req, res) => {
    try {
        const user = await userService.registerUser(req.body);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { accessToken, refreshToken, profile } = await userService.loginUser(req.body);

        const client = req.body.client;
        if (client && client === 'web') {
            // Set access token cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: 'Strict',
                secure: true,
                sameSite: 'None',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            // Set refresh token cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: 'Strict',
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
                profile
            });
        }
        else {
            res.status(200).json({
                access: accessToken,
                refresh: refreshToken,
                profile
            });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const client = req.body.client;
        if (client && client === 'web') {
            const { accessToken, refreshToken } = await userService.refreshToken(req.cookies.refreshToken);
            // Set access token cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: 'Strict',
                secure: true,
                sameSite: 'None',
                maxAge: 15 * 60 * 1000, // 15 minutes
            });

            // Set refresh token cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                // secure: process.env.NODE_ENV === 'production',
                // sameSite: 'Strict',
                secure: true,
                sameSite: 'None',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
                message: "refresh token successfully"
            });
        }
        else {
            const { accessToken, refreshToken } = await userService.refreshToken(req.body.refresh);
            res.status(200).json({
                access: accessToken,
                refresh: refreshToken
            });
        }


    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.verifyUser = async (req, res) => {
    try {
        const client = req.body.client;
        if (client && client === 'web') {
            const accessToken = req.cookies.accessToken;
            const { profile } = await userService.verifyUser(accessToken);
            res.status(200).json({
                profile
            });
        }
        else {
            const authHeader = req.headers['authorization'];
            const accessToken = authHeader && authHeader.split(' ')[1];
            const { profile } = await userService.verifyUser(accessToken);
            res.status(200).json({
                access: accessToken,
                profile
            });
        }

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.savePushToken = async (req, res) => {
    const { pushToken } = req.body;
    const userId = req.user.id;

    if (!userId) {
        return res.status(400).json({ error: 'user ID are required' });
    }

    try {
        await userService.savePushToken(userId, pushToken);
        res.status(200).json({ message: 'Push token saved successfully' });
    } catch (error) {
        console.error('Error saving push token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: true, // Must be true if SameSite is 'None'
        sameSite: 'None',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true, // Must be true if SameSite is 'None'
        sameSite: 'None',
    });
    res.json({ message: 'Logged out successfully' });

}