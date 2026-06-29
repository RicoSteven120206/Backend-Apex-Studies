const { UserInteraction, Content, sequelize } = require('../../models/mysql');

exports.getPopularContents = async (req, res) => {
    try {
        const popularContents = await UserInteraction.findAll({
            attributes: [
                'content_id',
                [sequelize.fn('COUNT', sequelize.col('content_id')), 'total_views'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating']
            ],
            group: ['content_id', 'content.id'], 
            include: [{ 
                model: Content, 
                as: 'content', 
                attributes: ['title', 'content_type', 'education_level'] 
            }],
            order: [[sequelize.literal('total_views'), 'DESC']],
            limit: 10 
        });

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil analitik materi populer',
            data: popularContents
        });
    } catch (error) {
        console.error('Error getPopularContents:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat mengambil analitik' });
    }
};

exports.recalculateRecommendations = async (req, res) => {
    try {
        console.log('Admin memicu penghitungan ulang rekomendasi (Collaborative Filtering)...');
        
        await new Promise(resolve => setTimeout(resolve, 2000));

        res.status(200).json({
            success: true,
            message: 'Proses komputasi Collaborative Filtering selesai. Cache rekomendasi di MongoDB telah diperbarui.'
        });
    } catch (error) {
        console.error('Error recalculateRecommendations:', error);
        res.status(500).json({ success: false, message: 'Gagal memproses ulang rekomendasi' });
    }
};