package blockchain

import (
	"errors"
	"strings"
	"time"

	"github.com/jjhwan-h/DIDI/blockchain/db"
	"github.com/jjhwan-h/DIDI/blockchain/utils"
)

type TxVote struct {
	RoomId string
	Choice string
}
type Block struct {
	Hash       string  `json:"hash"`
	PrevHash   string  `json:"prevHash,omitempty"`
	Height     int     `json:"height"`
	Difficulty int     `json:"difficulty"`
	Nonce      int     `json:"nonce"`
	Timestamp  int     `json:"timestamp"`
	TxVote     *TxVote `json:"txVote"`
}

var ErrNotFound = errors.New("block not found")

func persistBlock(b *Block) {
	db.SaveBlock(b.Hash, utils.ToBytes(b))
}

func (b *Block) restore(data []byte) {
	utils.FromBytes(b, data)
}

func FindBlock(hash string) (*Block, error) {
	blockBytes := db.Block(hash)
	if blockBytes == nil {
		return nil, ErrNotFound
	}
	block := &Block{}
	block.restore(blockBytes)
	return block, nil
}

func (b *Block) mine() {
	target := strings.Repeat("0", b.Difficulty)
	for {
		b.Timestamp = int(time.Now().Unix())
		hash := utils.Hash(b)
		//fmt.Printf("Target:%s\nHash:%s\nNonce:%d", target, hash, b.Nonce)
		if strings.HasPrefix(hash, target) {
			b.Hash = hash
			break
		} else {
			b.Nonce++
		}
	}
}

func createBlock(prevHash string, height int, roomId string, choice string) *Block {
	block := Block{
		Hash:       "",
		PrevHash:   prevHash,
		Height:     height,
		Difficulty: Blockchain().difficulty(),
		Nonce:      0,
		TxVote:     &TxVote{roomId, choice},
	}
	block.mine()
	persistBlock(&block)
	return &block
}
