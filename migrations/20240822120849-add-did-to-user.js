'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user','did',{
      type:Sequelize.STRING,
      allowNull:true,
    })
  },

  async down (queryInterface, Sequelize) {
  }
};
