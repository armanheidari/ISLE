import torch 


COLUMN_NAME = "processed_text"

N_TOPICS = 10
SAMPLE_SIZE = 5000
REDUCE_TOPICS = False

N_TRIALS = 20

USE_TRAIN_CHECKPOINT = False

if torch.cuda.is_available():
    DEVICE = torch.device("cuda")

elif torch.mps.is_available():
    DEVICE = torch.device("mps")
    
else:
    DEVICE = torch.device("cpu")
    