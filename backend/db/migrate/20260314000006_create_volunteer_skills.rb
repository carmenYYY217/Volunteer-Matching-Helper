class CreateVolunteerSkills < ActiveRecord::Migration[7.0]
  def change
    create_table :volunteer_skills do |t|
      t.references :volunteer, null: false, foreign_key: true
      t.references :skill, null: false, foreign_key: true

      t.timestamps
    end
    add_index :volunteer_skills, [:volunteer_id, :skill_id], unique: true
  end
end
