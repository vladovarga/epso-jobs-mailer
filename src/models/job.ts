import { DataTypes, Model, Op } from 'sequelize';
import { sequelizeInstance } from '../inits/sequelize'

export interface Job {
    id: number,
    created_at: Date,
    title: string,
    href: string,
    domain: string,
    grade: string,
    institution: string,
    location: string,
    deadline: string,
    position_type: string
}

export class Job extends Model {
    city_code: any;
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
            // for debug purposes
            // where: {
            //     id: 144
            // },
            order: [
                ['location', 'ASC'],
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
    href: {
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    domain: {
        comment: 'Job domain(s)',
        type: DataTypes.STRING,
        allowNull: false
        // allowNull defaults to true
    },
    grade: {
        comment: 'Job grade(s): AST 4, AD 6, FG IV, ...',
        type: DataTypes.STRING,
        allowNull: false
    },
    institution: {
        comment: 'Institution/EU body',
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        comment: 'Location string with country in brackets: Brussels (Belgium), Valletta (Malta), ...',
        type: DataTypes.STRING,
        allowNull: false
    },
    deadline: {
        comment: 'Deadline string in format dd/mm/yyy - HH:mm',
        type: DataTypes.STRING,
        allowNull: false
    },
    position_type: {
        comment: 'Position type: permanent_staff, temp, cast, seconded, ...',
        type: DataTypes.STRING,
        allowNull: false
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