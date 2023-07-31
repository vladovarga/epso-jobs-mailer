import { DataTypes, Model, Op } from 'sequelize';
import { sequelizeInstance } from '../inits/sequelize'

export interface Job {
    id: number,
    created_at: Date,
    title: string,
    grade: string,
    href: string,
    city: string
}

export class Job extends Model {
    /**
     * Queries saved jobs since certain timestamp
     * 
     * @param {Date} since
     * 
     * @returns
     */
    public static async getJobsSince(since?: any) {
        let whereClause

        if (since != null) {
            whereClause = {
                created_at: {
                    [Op.gt]: since
                }
            }
        }

        return Job.findAll({
            where: whereClause,
            order: [
                ['city', 'ASC'],
            ]
        })
    }
}

Job.init({
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
    title: {
        comment: 'Job title as it was mentioned on the EPSO website',
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    grade: {
        comment: 'Job grade as it was mentioned on the EPSO website',
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    href: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    city: {
        comment: 'City code taken from the cities enum',
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
    sequelize: sequelizeInstance,         // the connection instance
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false                     // we dont need this column for now
});