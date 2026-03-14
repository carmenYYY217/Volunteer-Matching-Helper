class CreateRoles < ActiveRecord::Migration[7.0]
  def change
    create_table :roles do |t|
      t.string :title, null: false
      t.text :description
      t.date :event_date
      t.string :status, default: 'open'

      t.timestamps
    end
  end
end
