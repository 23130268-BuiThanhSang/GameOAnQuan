import javax.swing.*;
import java.awt.*;

public class GameWindow extends JFrame {
    public GameManager gameManager;
    public JButton[] tileButtons;
    public JLabel p1ScoreLabel;
    public JLabel p2ScoreLabel;
    public JLabel turnLabel;

    public GameWindow() {
        // Initialize the game engine
        gameManager = new GameManager("Player 1", "Player 2");
        tileButtons = new JButton[12];

        // Setup the Main Window
        setTitle("Ô Ăn Quan - Local Pass & Play");
        setSize(900, 300);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // Setup UI Components
        setupTopPanel();
        setupBoardUI();

        // Initial UI Refresh
        refreshUI();
        setVisible(true);
    }

    private void setupTopPanel() {
        JPanel topPanel = new JPanel(new GridLayout(1, 3));
        topPanel.setBackground(Color.LIGHT_GRAY);

        p1ScoreLabel = new JLabel("Player 1 Score: 0", SwingConstants.CENTER);
        turnLabel = new JLabel("Turn: Player 1", SwingConstants.CENTER);
        p2ScoreLabel = new JLabel("Player 2 Score: 0", SwingConstants.CENTER);

        topPanel.add(p1ScoreLabel);
        topPanel.add(turnLabel);
        topPanel.add(p2ScoreLabel);

        add(topPanel, BorderLayout.NORTH);
    }

    private void setupBoardUI() {
        JPanel centerPanel = new JPanel(new GridLayout(2, 5)); // 2 rows, 5 columns for citizens

        // Initialize all 12 buttons
        for (int i = 0; i < 12; i++) {
            int index = i; // capture for lambda
            tileButtons[i] = new JButton();
            tileButtons[i].setFont(new Font("Arial", Font.BOLD, 16));

            // Add click listener
            tileButtons[i].addActionListener(e -> handleTileClick(index));
        }

        // --- MAP BUTTONS TO THE VISUAL BOARD ---

        // West Mandarin (Index 11)
        tileButtons[11].setPreferredSize(new Dimension(150, 0));
        add(tileButtons[11], BorderLayout.WEST);

        // East Mandarin (Index 5)
        tileButtons[5].setPreferredSize(new Dimension(150, 0));
        add(tileButtons[5], BorderLayout.EAST);

        centerPanel.add(tileButtons[0]);
        centerPanel.add(tileButtons[1]);
        centerPanel.add(tileButtons[2]);
        centerPanel.add(tileButtons[3]);
        centerPanel.add(tileButtons[4]);

        centerPanel.add(tileButtons[10]);
        centerPanel.add(tileButtons[9]);
        centerPanel.add(tileButtons[8]);
        centerPanel.add(tileButtons[7]);
        centerPanel.add(tileButtons[6]);

        add(centerPanel, BorderLayout.CENTER);
    }

    private void handleTileClick(int index) {
        // 1. Check if the move is allowed
        if (!gameManager.isValidMove(index)) {
            JOptionPane.showMessageDialog(this, "Invalid move! Choose a valid square with pieces.");
            return;
        }

        // 2. Ask the player for direction
        String[] options = {"Clockwise", "Clockdumb"};
        int choice = JOptionPane.showOptionDialog(
                this,
                "Which direction?",
                "Move Direction",
                JOptionPane.DEFAULT_OPTION,
                JOptionPane.QUESTION_MESSAGE,
                null,
                options,
                options[0]
        );

        if (choice == -1) return;
        int direction = (choice == 0) ? 1 : -1;

        // 4. Play the turn and update the screen
        gameManager.playTurn(index, direction);
        refreshUI();

        // 5. Check for End Game (Simplified: if both mandarins are dead)
        if (gameManager.board[5].mandarinPieces == 0 && gameManager.board[11].mandarinPieces == 0) {
            declareWinner();
        }
    }

    private void refreshUI() {
        // Update Button Text
        for (int i = 0; i < 12; i++) {
            Tile t = gameManager.board[i];

            if (t.isMandarin) {
                // Show big stone + any citizens that landed there
                String text = "<html><center>Quan<br>Big: " + t.mandarinPieces + "<br>Small: " + t.citizenPieces+ "<br>Mult:" + t.mult + "</center></html>";
                tileButtons[i].setText(text);
                tileButtons[i].setBackground(new Color(255, 200, 200)); // Light red for Mandarins
            } else {
                tileButtons[i].setText("Dân: " + t.citizenPieces + " - Mult:" + t.mult);
                // Color code the rows based on who owns them
                if (i >= 0 && i <= 4) tileButtons[i].setBackground(new Color(200, 220, 255)); // P1 Blue
                if (i >= 6 && i <= 10) tileButtons[i].setBackground(new Color(200, 255, 200)); // P2 Green
            }
        }

        // Update Labels (Directly accessing the public variables!)
        p1ScoreLabel.setText(gameManager.player1.name + " Score: " + gameManager.player1.score);
        p2ScoreLabel.setText(gameManager.player2.name + " Score: " + gameManager.player2.score);
        turnLabel.setText("Current Turn: " + gameManager.currentPlayer.name);
    }

    private void declareWinner() {
        String winner;
        if (gameManager.player1.score > gameManager.player2.score) {
            winner = gameManager.player1.name + " Wins!";
        } else if (gameManager.player2.score > gameManager.player1.score) {
            winner = gameManager.player2.name + " Wins!";
        } else {
            winner = "It's a Tie!";
        }

        JOptionPane.showMessageDialog(this, "Game Over! Both Mandarins are captured.\n" + winner);
        System.exit(0);
    }

    public static void main(String[] args) {
        // This launches your entire application
        SwingUtilities.invokeLater(() -> new GameWindow());
    }
}