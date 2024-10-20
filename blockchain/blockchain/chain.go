package blockchain

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/jjhwan-h/DIDI/blockchain/db"
	"github.com/jjhwan-h/DIDI/blockchain/utils"
)

const (
	defaultDifficulty  int = 1
	difficultyInterval int = 10 // 10개 마다 difficulty 재 측정
	blockInterval      int = 1  // 1분 마다 block 생성
	allowdRange        int = 5
)

type blockchain struct {
	NewestHash        string `json:"newestHash"`
	Height            int    `json:"height"`
	CurrentDifficulty int    `json:"currentDifficulty"`
	m                 sync.Mutex
}

var b *blockchain
var once sync.Once

func (b *blockchain) restore(data []byte) {
	utils.FromBytes(b, data)
}

func persistBlockchain(b *blockchain) {
	db.SaveCheckpoint(utils.ToBytes(b))
}

func (b *blockchain) AddBlock(roomId string, choice string) *Block {
	block := createBlock(b.NewestHash, b.Height+1, roomId, choice)
	b.NewestHash = block.Hash
	b.Height = block.Height
	b.CurrentDifficulty = block.Difficulty
	persistBlockchain(b)

	return block
}

func (b *blockchain) Blocks() []*Block {
	b.m.Lock()
	defer b.m.Unlock()
	var blocks []*Block
	hashCursor := b.NewestHash
	for {
		block, _ := FindBlock(hashCursor)
		blocks = append(blocks, block)
		if block.PrevHash != "" {
			hashCursor = block.PrevHash
		} else {
			break
		}
	}
	return blocks
}

func (b *blockchain) recalculateDifficulty() int {
	allBlocks := b.Blocks()
	newestBlock := allBlocks[0]
	lastRecalculatedBlock := allBlocks[difficultyInterval-1]
	actualTime := (newestBlock.Timestamp / 60) - (lastRecalculatedBlock.Timestamp / 60)
	expectedTime := difficultyInterval * blockInterval

	if actualTime <= (expectedTime - allowdRange) {
		return b.CurrentDifficulty + 1
	} else if actualTime >= (expectedTime + allowdRange) {
		return b.CurrentDifficulty - 1
	}
	return b.CurrentDifficulty
}

func (b *blockchain) difficulty() int {
	if b.Height == 0 {
		return defaultDifficulty
	} else if b.Height%difficultyInterval == 0 {
		return b.recalculateDifficulty()
	} else {
		return b.CurrentDifficulty
	}
}

func Blockchain() *blockchain {
	if b == nil {
		once.Do(func() { // 오직 한번만 실행되도록 처리(병렬처리나 go routine등을 사용하더라도)
			b = &blockchain{
				Height: 0,
			}
			checkpoint := db.Checkpoint()
			if checkpoint == nil {
				b.AddBlock("0", "0")
			} else {
				b.restore(checkpoint)
			}
		})
	}
	return b
}

func Status(b *blockchain, rw http.ResponseWriter) {
	b.m.Lock()
	defer b.m.Unlock()

	json.NewEncoder(rw).Encode(Blockchain())
}

func (b *blockchain) Replace(newBlocks []*Block) {
	b.m.Lock()
	defer b.m.Unlock()
	b.CurrentDifficulty = newBlocks[0].Difficulty
	b.Height = len(newBlocks)
	b.NewestHash = newBlocks[0].Hash
	persistBlockchain(b)
	db.EmptyBlocks()

	for _, block := range newBlocks {
		persistBlock(block)
	}
}

func (b *blockchain) AddPeerBlock(block *Block) {
	b.m.Lock()
	defer b.m.Unlock()

	b.Height += 1
	b.CurrentDifficulty = block.Difficulty
	b.NewestHash = block.Hash

	persistBlockchain(b)
	persistBlock(block)

	//mempool

}
