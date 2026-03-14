class CreateAvailabilities < ActiveRecord::Migration[7.0]
  def change
    create_table :availabilities do |t|
      t.references :volunteer, null: false, foreign_key: true
      t.string :day_of_week, null: false
      t.string :time_of_day, null: false

      t.timestamps
    end
  end
end
