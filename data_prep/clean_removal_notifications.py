import pandas as pd
import re

def clean_removal_notifications():
    """
    Clean the removal notifications CSV by extracting numeric TreeID values.
    """
    print("Reading removal notifications CSV...")
    df = pd.read_csv('Street_Tree_Removal_Notifications_20250814.csv')
    
    print(f"Initial records: {len(df)}")
    print("Sample TreeID values before cleaning:")
    print(df['TreeID'].unique()[:10])
    
    def extract_numeric_tree_id(tree_id):
        """
        Extract numeric part from TreeID, handling both plain numbers and TRE- prefixed IDs.
        """
        if pd.isna(tree_id):
            return None
        
        tree_id_str = str(tree_id).strip()
        
        # If it starts with TRE-, extract the numeric part
        if tree_id_str.startswith('TRE-'):
            numeric_part = tree_id_str.replace('TRE-', '')
            try:
                return int(numeric_part)
            except ValueError:
                print(f"Warning: Could not convert {tree_id_str} to numeric ID")
                return None
        else:
            # Try to convert directly to int
            try:
                return int(float(tree_id_str))  # float first in case of decimal notation
            except ValueError:
                print(f"Warning: Could not convert {tree_id_str} to numeric ID")
                return None
    
    # Apply the cleaning function
    df['CleanedTreeID'] = df['TreeID'].apply(extract_numeric_tree_id)
    
    # Remove rows where we couldn't extract a valid TreeID
    initial_count = len(df)
    df = df.dropna(subset=['CleanedTreeID'])
    df['CleanedTreeID'] = df['CleanedTreeID'].astype(int)
    final_count = len(df)
    
    print(f"Successfully cleaned {final_count} records ({initial_count - final_count} records dropped due to invalid TreeID)")
    print("Sample CleanedTreeID values:")
    print(df['CleanedTreeID'].unique()[:10])
    
    # Save the cleaned data
    output_file = 'cleaned_removal_notifications.csv'
    df.to_csv(output_file, index=False)
    print(f"Saved cleaned removal notifications to {output_file}")
    
    # Also save just the TreeID list for easy reference
    tree_ids_only = df[['CleanedTreeID']].copy()
    tree_ids_only.to_csv('removal_tree_ids.csv', index=False)
    print(f"Saved tree IDs only to removal_tree_ids.csv")
    
    return df

if __name__ == "__main__":
    clean_removal_notifications()
