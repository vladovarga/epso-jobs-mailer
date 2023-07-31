import { DataTypes, Model, Op } from 'sequelize';
import { sequelizeInstance } from '../inits/sequelize'

export interface User {
    id: number,
    created_at: Date
    updated_at: Date
    email: string
    token: string
    settings: {
        cities: Object
    }
    is_verified: boolean
}

export class User extends Model {
    /**
     * Queries saved jobs since certain timestamp
     * 
     * @param {Date} since
     * 
     * @returns
     */
    // public static async getJobsSince(since: any) {
    //     return Job.findAll({
    //         where: {
    //             created_at: {
    //                 [Op.gt]: since
    //             }
    //         },
    //         order: [
    //             ['city', 'ASC'],
    //         ]
    //     })
    // }
}

User.init({
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    settings: {
        type: DataTypes.JSONB,
        allowNull: false
        // allowNull defaults to true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
    sequelize: sequelizeInstance,         // the connection instance
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});