import { DataTypes, Model } from 'sequelize';
import { sequelizeInstance } from '../inits/sequelize'

export interface MailerRun {
    created_at: Date
    was_successful: Date
    result: string
}

export class MailerRun extends Model {
    /**
     * Saves current mailer run, either a successful or an unsuccessful one
     * 
     * @param {boolean} wasSuccessful - boolean flag whether the run was ok or not
     * @param {Object} result - optional run result in a form of an object
     * 
     * @returns
     */
    public static async saveRun(wasSuccessful: boolean, result?: any): Promise<MailerRun> {
        return MailerRun.create({
            was_successful: wasSuccessful,
            result: result
        })
    }

    /**
     * Finds the last successful mailer run and returns it
     * 
     * @returns
     */
    public static async getLastSuccessfulRun(): Promise<MailerRun | null> {
        return MailerRun.findOne({
            where: {
                was_successful: true
            },
            order: [
                ['created_at', 'DESC'],
            ],
            limit: 1
        })
    }
}

MailerRun.init({
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
    was_successful: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    result: {
        type: DataTypes.JSONB,
        allowNull: false
        // allowNull defaults to true
    }
}, {
    // Other model options go here
    sequelize: sequelizeInstance,         // the connection instance
    modelName: 'MailerRun',
    tableName: 'mailer_run',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false                     // we dont need this column for now
});