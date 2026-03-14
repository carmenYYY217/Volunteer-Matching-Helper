class CreateVolunteers < ActiveRecord::Migration[7.0]
  def change
    create_table :volunteers do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :phone
      t.string :status, default: 'active'

      t.timestamps
    end
    add_index :volunteers, :email, unique: true
  end
end
