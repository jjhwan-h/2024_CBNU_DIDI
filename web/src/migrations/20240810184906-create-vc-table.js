// migrations/XXXXXX-create-vc-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.createTable('vc', {
          id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true
          },
          isUsed: {
              type: Sequelize.BOOLEAN,
              allowNull: false
          },
          RoomId: {
              type: Sequelize.INTEGER,
              references: {
                  model: 'room', 
                  key: 'id'
              },
              allowNull: true 
          },
          createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.NOW
          },
          updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.NOW
          }
      });
  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.dropTable('vc');
  }
};
