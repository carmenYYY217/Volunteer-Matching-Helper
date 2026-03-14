class ChangeCvUrlToTextInVolunteers < ActiveRecord::Migration[7.0]
  def up
    change_column :volunteers, :cv_url, :text
  end

  def down
    change_column :volunteers, :cv_url, :string
  end
end
