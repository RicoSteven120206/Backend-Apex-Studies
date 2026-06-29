const { User, Content, Subject } = require('../models/mysqlModel/index');

class RecommendationService {
    static async getInitialRecommendation(userId) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('User tidak ditemukan di database.');
            }

            const recommendations = await Content.findAll({
                where: {
                    education_level: user.education_level,
                    grade: user.grade
                },
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['name']
                    }
                ],
            });

            return {
                user: { name: user.name, level: user.education_level, grade: user.grade },
                recommendations: recommendations
            };
        } catch (error) {
            throw(error);
        }
    }
};

module.exports = RecommendationService;